import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Auth Users (password stored as plaintext for seed only – replace with hashed in production) ──
  const alice = await prisma.authUser.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      publicId: 'usr_1',
      email: 'alice@example.com',
      password: 'strongpass',
      locked: false,
    },
  });

  const bob = await prisma.authUser.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      publicId: 'usr_2',
      email: 'bob@example.com',
      password: 'strongpass',
      locked: false,
    },
  });

  console.log(`Upserted auth users: ${alice.email}, ${bob.email}`);

  // ── Managed Users ──
  const jane = await prisma.managedUser.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      publicId: 'usr_3',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    },
  });

  console.log(`Upserted managed user: ${jane.email}`);

  console.log('Seeding complete.');
}

main()
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
