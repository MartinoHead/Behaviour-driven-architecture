const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const START_MARKER = '<!-- CLOSED-LOOP:START -->';
const END_MARKER = '<!-- CLOSED-LOOP:END -->';

function parseArgs(argv) {
  const args = { input: null, runGenerator: false };

  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--input') {
      args.input = argv[i + 1] || null;
      i += 1;
      continue;
    }

    if (argv[i] === '--run-generator') {
      args.runGenerator = true;
    }
  }

  return args;
}

function readJson(filePath) {
  if (!filePath) {
    throw new Error('Missing --input path. Example: node scripts/closed-loop-simulator.js --input scripts/closed-loop-input.json');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractMinPasswordLength(text) {
  const match = String(text || '').match(/(\d+)\s*characters?/i);
  return match ? Number(match[1]) : null;
}

function ensureTraceBlock(content, lines) {
  const block = `${START_MARKER}\n## Closed Loop Trace\n${lines.map((line) => `- ${line}`).join('\n')}\n${END_MARKER}`;

  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);

  if (startIndex >= 0 && endIndex > startIndex) {
    return `${content.slice(0, startIndex)}${block}${content.slice(endIndex + END_MARKER.length)}`;
  }

  return `${content.trimEnd()}\n\n${block}\n`;
}

function analyzeImpact(pr) {
  const filesChanged = Array.isArray(pr.filesChanged) ? pr.filesChanged : [];
  const description = String(pr.description || '');
  const searchable = `${filesChanged.join(' ')} ${description}`.toLowerCase();

  const impactedDomains = [];

  if (/(register|registration|password|email|auth)/i.test(searchable)) {
    impactedDomains.push('registration');
  }
  if (/(user|profile|account)/i.test(searchable)) {
    impactedDomains.push('users');
  }
  if (/(checkout|cart|payment|order|shipping)/i.test(searchable)) {
    impactedDomains.push('checkout');
  }

  return [...new Set(impactedDomains)];
}

function mapDomainToKnowledgeFiles(domain, knowledgeRoot) {
  if (domain === 'registration') {
    return [path.join(knowledgeRoot, 'registration', 'registration.md')];
  }

  if (domain === 'users') {
    return [
      path.join(knowledgeRoot, 'create-user', 'create-user.md'),
      path.join(knowledgeRoot, 'get-user', 'get-user.md'),
    ];
  }

  if (domain === 'checkout') {
    return [path.join(knowledgeRoot, 'checkout', 'checkout.md')];
  }

  return [];
}

function updateRegistration(content, description, requestedLength) {
  let next = content;
  const updates = [];

  const passwordRuleRegex = /-\s*REG-003:\s*Password length must be at least\s*(\d+)\s*characters\./i;
  const match = next.match(passwordRuleRegex);

  if (match && requestedLength) {
    const oldLength = Number(match[1]);
    if (oldLength !== requestedLength) {
      next = next.replace(
        passwordRuleRegex,
        `- REG-003: Password length must be at least ${requestedLength} characters.`
      );
      updates.push({
        summary: `registration.md updated: password min length ${oldLength} -> ${requestedLength}`,
        patch: [
          `- Password length must be at least ${oldLength} characters`,
          `+ Password length must be at least ${requestedLength} characters`,
        ],
      });
    }
  }

  if (/email/i.test(description)) {
    updates.push({
      summary: 'registration.md reviewed: email validation behavior impacted',
      patch: [],
    });
  }

  if (!updates.length) {
    updates.push({
      summary: 'registration.md reviewed: no direct rule text change needed',
      patch: [],
    });
  }

  return { next, updates };
}

function updateKnowledgeFiles(knowledgeFiles, domain, pr) {
  const allUpdates = [];
  const requestedLength = extractMinPasswordLength(pr.description || '');

  for (const file of knowledgeFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }

    const current = fs.readFileSync(file, 'utf8');
    let next = current;
    let updates = [];

    if (domain === 'registration') {
      const result = updateRegistration(next, pr.description || '', requestedLength);
      next = result.next;
      updates = result.updates;
    } else {
      updates = [{
        summary: `${path.basename(file)} reviewed: ${domain} behavior impacted by PR`,
        patch: [],
      }];
    }

    next = ensureTraceBlock(next, [
      `updatedAt: ${new Date().toISOString()}`,
      `domain: ${domain}`,
      `reason: ${String(pr.description || 'no description provided')}`,
    ]);

    if (next !== current) {
      fs.writeFileSync(file, next, 'utf8');
    }

    const rel = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');
    allUpdates.push({ file: `/${rel}`, updates });
  }

  return allUpdates;
}

function main() {
  const args = parseArgs(process.argv);
  const projectRoot = path.join(__dirname, '..');
  const inputPath = args.input ? path.resolve(process.cwd(), args.input) : null;
  const pr = readJson(inputPath);

  const impactedDomains = analyzeImpact(pr);
  const knowledgeRoot = path.join(projectRoot, 'knowledge');

  const impactedFiles = [];
  for (const domain of impactedDomains) {
    impactedFiles.push(...mapDomainToKnowledgeFiles(domain, knowledgeRoot));
  }

  const uniqueFiles = [...new Set(impactedFiles)];
  const updatesByFile = [];

  for (const domain of impactedDomains) {
    const files = mapDomainToKnowledgeFiles(domain, knowledgeRoot);
    const updates = updateKnowledgeFiles(files, domain, pr);
    updatesByFile.push(...updates);
  }

  console.log('PR Received:');
  const changed = Array.isArray(pr.filesChanged) ? pr.filesChanged : [];
  if (changed.length) {
    for (const file of changed) {
      console.log(`- ${file}`);
    }
  } else {
    console.log('- (no files listed)');
  }
  console.log(`- description: ${String(pr.description || '(empty)')}`);
  console.log('');

  console.log('Impact Analysis:');
  if (!impactedDomains.length) {
    console.log('- no mapped domains detected');
  } else {
    for (const domain of impactedDomains) {
      console.log(`- ${domain} domain affected`);
    }
  }
  console.log('');

  console.log('Affected knowledge files:');
  if (!uniqueFiles.length) {
    console.log('- (none)');
  } else {
    for (const file of uniqueFiles) {
      const rel = path.relative(projectRoot, file).replace(/\\/g, '/');
      console.log(`- /${rel}`);
    }
  }
  console.log('');

  console.log('Knowledge Updates:');
  if (!updatesByFile.length) {
    console.log('- no updates applied');
  } else {
    for (const item of updatesByFile) {
      for (const update of item.updates) {
        console.log(`- ${update.summary}`);
        for (const line of update.patch) {
          console.log(`  ${line}`);
        }
      }
    }
  }
  console.log('');

  console.log('Next Step:');
  if (args.runGenerator) {
    console.log('- Triggering test generation from updated knowledge');
    execSync('npm run generate:md-tests', { cwd: projectRoot, stdio: 'inherit' });
  } else {
    console.log('- Trigger test generation from updated knowledge');
    console.log('- Suggested command: npm run generate:md-tests');
  }

  console.log('');
  console.log('Output Trace:');
  console.log('- Closed loop simulated: PR -> Impact -> Knowledge Update -> Test Regeneration Trigger');
}

main();
