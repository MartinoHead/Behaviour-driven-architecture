import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

// Prisma 7 configuration file.
// The connection URL lives here instead of in schema.prisma.
// Docs: https://pris.ly/d/config-datasource

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
