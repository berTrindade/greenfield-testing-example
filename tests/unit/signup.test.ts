import { describe, expect, it } from 'vitest'
import type { PaymentGateway, User, UsersRepo } from '../../src/ports.js'
import { signup } from '../../src/signup.js'

// Tier 1 - unit. In-memory fakes for both ports. No Docker, no network, no DB.
// This is where every branch of the logic is covered, cheaply, on every push.
class FakeUsersRepo implements UsersRepo {
  private users: User[] = []
  async create(email: string): Promise<User> {
    const user = { id: this.users.length + 1, email }
    this.users.push(user)
    return user
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null
  }
}

const okGateway: PaymentGateway = {
  async charge() {
    return { chargeId: 'ch_fake' }
  },
}

describe('signup (unit)', () => {
  it('creates a user and charges them', async () => {
    const result = await signup(new FakeUsersRepo(), okGateway, 'a@example.com')
    expect(result).toEqual({ id: 1, chargeId: 'ch_fake' })
  })

  it('rejects an invalid email before any I/O', async () => {
    await expect(signup(new FakeUsersRepo(), okGateway, 'nope')).rejects.toThrow(
      'invalid email',
    )
  })

  it('rejects a duplicate email', async () => {
    const repo = new FakeUsersRepo()
    await signup(repo, okGateway, 'a@example.com')
    await expect(signup(repo, okGateway, 'a@example.com')).rejects.toThrow(
      'email already registered',
    )
  })
})
