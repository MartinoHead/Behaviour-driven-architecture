const fs = require('fs');
const path = require('path');
const { getFeatureRules, verifyKnowledgeSync } = require('./knowledge-utils');

const knowledgeDir = path.join(__dirname, '..', 'knowledge');
const testDir = path.join(__dirname, '..', 'tests', 'api');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const { issues, bundle } = verifyKnowledgeSync(knowledgeDir);
if (issues.length) {
  console.error('Knowledge is not synchronized across md/yaml/gherkin:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

for (const feature of bundle) {
  const ruleEntries = getFeatureRules(feature);
  const specBaseName = feature.featureName.replace(/[\\/]/g, '-');
  const outFile = path.join(testDir, `${specBaseName}.api.spec.ts`);

  const tests = ruleEntries
    .map(
      ([id, text]) =>
        `test('[${id}] API ${text}', async ({ request }) => {\n` +
        `  // TODO: implement API scenario for ${id}.\n` +
        `  // Example: await request.post('/v1/...', { data: {...} });\n` +
        `});\n`
    )
    .join('\n');

  const content =
    `import { test } from '@playwright/test';\n\n` +
    `// Auto-generated API scaffold from synchronized knowledge (md/yaml/gherkin).\n` +
    `// Fill each TODO with executable API assertions.\n\n` +
    tests;

  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Generated ${path.relative(process.cwd(), outFile)}`);
}
