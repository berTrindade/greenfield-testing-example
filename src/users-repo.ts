import type { Pool } from 'pg'
import type { User, UsersRepo } from './ports.js'

export class PgUsersRepo implements UsersRepo {
  constructor(private pool: Pool) {}

  async create(email: string): Promise<User> {
    const { rows } = await this.pool.query<User>(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email',
      [email],
    )
    return rows[0]
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query<User>(
      'SELECT id, email FROM users WHERE email = $1',
      [email],
    )
    return rows[0] ?? null
  }
}
