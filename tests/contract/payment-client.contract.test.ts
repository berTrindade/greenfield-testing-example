import nock from 'nock'
import { afterEach, describe, expect, it } from 'vitest'
import { HttpPaymentGateway } from '../../src/payment-client.js'

// Tier 2 - contract. Pins the wire format of the third-party adapter against a
// mocked endpoint. Runs in CI on every PR and never touches the real provider,
// so it is fast and free but still fails the moment the request/response shape
// drifts from what we agreed with the provider.
const BASE_URL = 'https://payments.example.com'

afterEach(() => {
  nock.cleanAll()
})

describe('HttpPaymentGateway (contract)', () => {
  it('sends the agreed request shape and parses the agreed response', async () => {
    const scope = nock(BASE_URL)
      .post('/v1/charges', { email: 'a@example.com', amount_cents: 500 })
      .matchHeader('content-type', 'application/json')
      .reply(200, { charge_id: 'ch_123' })

    const result = await new HttpPaymentGateway(BASE_URL).charge('a@example.com', 500)

    expect(result).toEqual({ chargeId: 'ch_123' })
    expect(scope.isDone()).toBe(true) // request matched the contract exactly
  })

  it('surfaces a non-2xx as an error rather than swallowing it', async () => {
    nock(BASE_URL).post('/v1/charges').reply(402, { error: 'card_declined' })

    await expect(
      new HttpPaymentGateway(BASE_URL).charge('a@example.com', 500),
    ).rejects.toThrow('payment failed: 402')
  })
})
