import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Pool } from 'pg'

// ponytail: raw SQL file over a migration framework - one table, no versioning
// need yet. Swap in node-pg-migrate/Kysely migrations when schema history matters.
export async function migrate(pool: Pool): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url))
  const sql = readFileSync(join(here, '..', 'migrations', '001_init.sql'), 'utf8')
  await pool.query(sql)
}
