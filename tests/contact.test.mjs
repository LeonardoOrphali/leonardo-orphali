import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CONTACT_LIMITS, createContactService, isFormspreeEndpoint, validateContact,
} from '../src/services/contact.ts'

// All requests are mocked. These tests never contact Formspree or send email.
const endpoint = 'https://formspree.io/f/testonly'
const values = { name: ' Teste ', email: ' pessoa@example.com ', message: ' Mensagem de teste ' }
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
})
const kind = expected => error => error?.kind === expected

 test('accepts only public Formspree form endpoints; placeholders stay disabled', () => {
  assert.equal(isFormspreeEndpoint(endpoint), true)
  for (const url of ['', 'https://formspree.io/f/SEU_FORM_ID', 'https://example.com/f/test', 'http://formspree.io/f/test', 'https://formspree.io/f/test?to=other', 'https://user@formspree.io/f/test']) {
    assert.equal(isFormspreeEndpoint(url), false)
    assert.equal(createContactService(url).available, false)
  }
})

test('validates whitespace, email format and documented length limits', () => {
  assert.equal(Object.keys(validateContact({ name: '  ', email: '\t', message: '\n' })).length, 3)
  assert.ok(validateContact({ ...values, email: 'invalid' }).email)
  assert.deepEqual(validateContact(values), {})
  for (const field of ['name', 'email', 'message']) {
    assert.ok(validateContact({ ...values, [field]: 'x'.repeat(CONTACT_LIMITS[field] + 1) })[field])
  }
})

test('unconfigured forms cannot submit', async () => {
  const service = createContactService('', { fetch: () => assert.fail('Must not fetch') })
  await assert.rejects(service.send(values), kind('unavailable'))
})

test('posts trimmed JSON, Reply-To email and honeypot without recipient overrides', async () => {
  let calls = 0
  const service = createContactService(endpoint, { fetch: async (url, options) => {
    calls++
    assert.equal(url, endpoint)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Accept, 'application/json')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.equal(options.redirect, 'error')
    assert.deepEqual(JSON.parse(options.body), { name: 'Teste', email: 'pessoa@example.com', message: 'Mensagem de teste', _gotcha: '' })
    return jsonResponse({ ok: true })
  } })
  await service.send({ ...values, to: 'unexpected@example.com', _cc: 'unexpected@example.com' })
  assert.equal(calls, 1)
  assert.equal(values.name, ' Teste ')
})

test('blocks simultaneous requests and releases the guard after completion', async () => {
  let release
  let calls = 0
  const service = createContactService(endpoint, { fetch: () => {
    calls++
    return new Promise(resolve => { release = resolve })
  } })
  const first = service.send(values)
  await assert.rejects(service.send(values), kind('busy'))
  assert.equal(calls, 1)
  release(jsonResponse({ ok: true }))
  await first
  const next = service.send(values)
  assert.equal(calls, 2)
  release(jsonResponse({ ok: true }))
  await next
})

test('maps service validation errors to accessible field messages', async () => {
  const service = createContactService(endpoint, { fetch: async () => jsonResponse({ errors: [{ field: 'email', message: 'Invalid email' }] }, 422) })
  await assert.rejects(service.send(values), error => error.kind === 'validation' && !!error.fields.email)
})

for (const [status, expected] of [[400, 'validation'], [429, 'rate-limit'], [403, 'service'], [500, 'service']]) {
  test(`handles HTTP ${status} without claiming success`, async () => {
    const service = createContactService(endpoint, { fetch: async () => jsonResponse({}, status) })
    await assert.rejects(service.send(values), kind(expected))
  })
}

test('rejects invalid JSON and explicit failure even with HTTP 200', async () => {
  for (const response of [new Response('not JSON'), jsonResponse({ ok: false }), jsonResponse({ errors: [{ message: 'Failure' }] })]) {
    const service = createContactService(endpoint, { fetch: async () => response })
    await assert.rejects(service.send(values), kind('service'))
  }
})

test('reports network failure and preserves caller values', async () => {
  const before = { ...values }
  const service = createContactService(endpoint, { fetch: async () => { throw new TypeError('Network failure') } })
  await assert.rejects(service.send(values), kind('network'))
  assert.deepEqual(values, before)
})

const abortableFetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
  signal.addEventListener('abort', () => reject(signal.reason), { once: true })
})

test('aborts on timeout and clears the duplicate guard afterwards', async () => {
  const service = createContactService(endpoint, { fetch: abortableFetch, timeoutMs: 5 })
  await assert.rejects(service.send(values), kind('timeout'))
  await assert.rejects(service.send(values), kind('timeout'))
})

test('supports caller cancellation before and during the request', async () => {
  const service = createContactService(endpoint, { fetch: abortableFetch })
  const before = new AbortController()
  before.abort()
  await assert.rejects(service.send(values, { signal: before.signal }), kind('cancelled'))
  const during = new AbortController()
  const request = service.send(values, { signal: during.signal })
  during.abort()
  await assert.rejects(request, kind('cancelled'))
})

test('filled honeypot is not reported as successfully delivered', async () => {
  const service = createContactService(endpoint, { fetch: () => assert.fail('Must not fetch') })
  await assert.rejects(service.send(values, { honeypot: 'spam' }), kind('validation'))
})
