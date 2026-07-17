import type { PaymentGateway, UsersRepo } from './ports.js'

// Pure orchestration over the two ports. No I/O of its own, so the unit tier
// exercises every branch here with in-memory fakes and zero infrastructure.
export async function signup(
  repo: UsersRepo,
  payments: PaymentGateway,
  email: string,
): Promise<{ id: number; chargeId: string }> {
  if (!email.includes('@')) {
    throw new Error('invalid email')
  }
  if (await repo.findByEmail(email)) {
    throw new Error('email already registered')
  }
  const user = await repo.create(email)
  const { chargeId } = await payments.charge(email, 500)
  return { id: user.id, chargeId }
}
