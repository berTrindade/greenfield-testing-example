import { defineConfig } from 'vitest/config'

// Three tiers, one runner. Every tier runs in CI on every PR:
//   unit        - pure logic, no I/O, milliseconds
//   contract    - the third-party adapter against a mocked HTTP endpoint (nock)
//   integration - the repo against a real Postgres in Docker (Testcontainers)
// A live suite against a deployed environment is intentionally absent - add it as
// a scheduled/post-deploy job once there is something deployed to hit.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'contract',
          include: ['tests/contract/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
