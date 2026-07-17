import type { PaymentGateway } from './ports.js'

// The one place that knows the payment provider's wire format. The contract
// tier pins this request/response shape against a mocked endpoint so a provider
// change breaks the build without ever calling the real API in CI.
export class HttpPaymentGateway implements PaymentGateway {
  constructor(private baseUrl: string) {}

  async charge(email: string, cents: number): Promise<{ chargeId: string }> {
    const res = await fetch(`${this.baseUrl}/v1/charges`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, amount_cents: cents }),
    })
    if (!res.ok) {
      throw new Error(`payment failed: ${res.status}`)
    }
    const body = (await res.json()) as { charge_id: string }
    return { chargeId: body.charge_id }
  }
}
