import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../../src/db.js'
import { PgUsersRepo } from '../../src/users-repo.js'

// Tier 3 - integration. A real Postgres in Docker via Testcontainers, real
// migrations, real SQL. This catches what an in-memory fake never could - here,
// the UNIQUE(email) constraint. Runs in CI on every PR (GitHub runners ship
// Docker); no shared staging database, fresh container per run.
describe('PgUsersRepo (integration)', () => {
  let container: StartedPostgreSqlContainer
  let pool: Pool
  let repo: PgUsersRepo

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start()
    pool = new Pool({ connectionString: container.getConnectionUri() })
    await migrate(pool)
    repo = new PgUsersRepo(pool)
  })

  afterAll(async () => {
    await pool?.end()
    await container?.stop()
  })

  it('round-trips a user through real SQL', async () => {
    const created = await repo.create('a@example.com')
    expect(created.id).toBeGreaterThan(0)

    const found = await repo.findByEmail('a@example.com')
    expect(found).toEqual(created)
  })

  it('returns null for an unknown email', async () => {
    expect(await repo.findByEmail('missing@example.com')).toBeNull()
  })

  it('enforces the UNIQUE(email) constraint an in-memory fake would miss', async () => {
    await repo.create('dupe@example.com')
    await expect(repo.create('dupe@example.com')).rejects.toThrow(/unique/i)
  })
})
