export type ContactValues = { name: string; email: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactValues, string>>

// Client-side limits keep submissions bounded; mirror them in Formspree rules if needed.
export const CONTACT_LIMITS = { name: 120, email: 254, message: 5000 } as const
export const CONTACT_TIMEOUT_MS = 15_000

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}
  if (!values.name.trim()) errors.name = 'Informe seu nome.'
  else if (values.name.length > CONTACT_LIMITS.name) errors.name = 'Use até 120 caracteres no nome.'
  if (!values.email.trim()) errors.email = 'Informe seu e-mail.'
  else if (values.email.length > CONTACT_LIMITS.email) errors.email = 'Use até 254 caracteres no e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (!values.message.trim()) errors.message = 'Escreva sua mensagem.'
  else if (values.message.length > CONTACT_LIMITS.message) errors.message = 'Use até 5.000 caracteres na mensagem.'
  return errors
}

export function isFormspreeEndpoint(value: string): boolean {
  try {
    const url = new URL(value)
    return url.origin === 'https://formspree.io' && /^\/f\/[a-zA-Z0-9]+\/?$/.test(url.pathname)
      && !url.username && !url.password && !url.search && !url.hash
  } catch { return false }
}

type ErrorKind = 'unavailable' | 'validation' | 'busy' | 'network' | 'timeout' | 'cancelled' | 'rate-limit' | 'service'
export class ContactError extends Error {
  kind: ErrorKind
  fields: ContactErrors
  constructor(kind: ErrorKind, message: string, fields: ContactErrors = {}) {
    super(message)
    this.name = 'ContactError'
    this.kind = kind
    this.fields = fields
  }
}

type SendOptions = { signal?: AbortSignal; honeypot?: string }
type Dependencies = { fetch?: typeof fetch; timeoutMs?: number }

// Factory keeps HTTP requests mockable without an SDK or private credentials.
export function createContactService(rawEndpoint = '', dependencies: Dependencies = {}) {
  const endpoint = rawEndpoint.trim()
  const available = isFormspreeEndpoint(endpoint)
  let inFlight = false
  return {
    available,
    async send(values: ContactValues, options: SendOptions = {}): Promise<void> {
      if (inFlight) throw new ContactError('busy', 'Já existe uma mensagem sendo enviada. Aguarde.')
      if (!available) throw new ContactError('unavailable', 'O envio de mensagens ainda não está disponível.')
      const errors = validateContact(values)
      if (Object.keys(errors).length) throw new ContactError('validation', 'Confira os campos indicados antes de enviar.', errors)
      if (options.honeypot) throw new ContactError('validation', 'Não foi possível validar o formulário. Recarregue a página e tente novamente.')
      if (options.signal?.aborted) throw new ContactError('cancelled', 'Envio cancelado. Seus dados foram preservados.')

      inFlight = true
      const controller = new AbortController()
      let timedOut = false
      const cancel = () => controller.abort()
      options.signal?.addEventListener('abort', cancel, { once: true })
      const timer = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, dependencies.timeoutMs ?? CONTACT_TIMEOUT_MS)
      try {
        const response = await (dependencies.fetch ?? fetch)(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          // email is Formspree's Reply-To field. Recipient is configured only in its dashboard.
          body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim(), _gotcha: options.honeypot ?? '' }),
          signal: controller.signal,
          redirect: 'error',
        })
        if (response.status === 429) throw new ContactError('rate-limit', 'O limite de envios foi atingido. Aguarde alguns minutos e tente novamente.')
        const data: unknown = await response.json().catch(() => null)
        controller.signal.throwIfAborted()
        const payload = data && typeof data === 'object' ? data as Record<string, unknown> : null
        if (response.status === 400 || response.status === 422) {
          const fields: ContactErrors = {}
          if (Array.isArray(payload?.errors)) {
            for (const error of payload.errors) {
              if (!error || typeof error !== 'object' || !('field' in error)) continue
              if (error.field === 'name') fields.name = 'Confira o nome informado.'
              if (error.field === 'email') fields.email = 'Confira o endereço de e-mail informado.'
              if (error.field === 'message') fields.message = 'Confira o conteúdo da mensagem.'
            }
          }
          throw new ContactError('validation', 'O serviço recusou o envio. Confira os campos; se estiverem corretos, tente novamente mais tarde.', fields)
        }
        if (!response.ok || !payload || payload.ok === false || (Array.isArray(payload.errors) && payload.errors.length)) {
          throw new ContactError('service', 'Não foi possível confirmar o envio pelo serviço. Tente novamente mais tarde.')
        }
      } catch (error) {
        if (controller.signal.aborted) {
          throw new ContactError(timedOut ? 'timeout' : 'cancelled', timedOut
            ? 'O envio demorou demais. Não foi possível confirmar o recebimento. Confira sua conexão antes de tentar novamente.'
            : 'Envio cancelado. Seus dados foram preservados.')
        }
        if (error instanceof ContactError) throw error
        throw new ContactError('network', 'Falha de conexão. Confira sua internet e tente novamente. Seus dados foram preservados.')
      } finally {
        clearTimeout(timer)
        options.signal?.removeEventListener('abort', cancel)
        inFlight = false
      }
    },
  }
}

export const contactService = createContactService(import.meta.env?.VITE_FORMSPREE_ENDPOINT)
