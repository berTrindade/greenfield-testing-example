// The two seams that make every test tier cheap. Domain logic depends on these
// interfaces, never on pg or fetch directly, so a test can swap a fake, a real
// Postgres container, or a mocked HTTP endpoint without touching the logic.

export interface User {
  id: number
  email: string
}

export interface UsersRepo {
  create(email: string): Promise<User>
  findByEmail(email: string): Promise<User | null>
}

export interface PaymentGateway {
  charge(email: string, cents: number): Promise<{ chargeId: string }>
}
