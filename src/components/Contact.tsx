import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { contactService, validateContact } from '../services/contact'
import type { ContactErrors, ContactValues } from '../services/contact'
import './Contact.css'

const fields = [
  { name: 'name', label: 'Seu nome', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Seu e-mail', type: 'email', autoComplete: 'email' },
  { name: 'message', label: 'Sua mensagem' },
] as const


type Status = 'idle' | 'sending' | 'success' | 'error'

export function Contact() {
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const sending = useRef(false)

  function updateField(name: keyof ContactValues, value: string) {
    const next = { ...values, [name]: value }
    setValues(next)
    if (errors[name]) setErrors({ ...errors, [name]: validateContact(next)[name] })
    if (status !== 'sending') setStatus('idle')
  }

  function validateField(name: keyof ContactValues) {
    setErrors(previous => ({ ...previous, [name]: validateContact(values)[name] }))
  }

  // Blur validation stays usable while the sending integration is unavailable.
  function focusInvalidField(form: HTMLFormElement, nextErrors: ContactErrors) {
    const name = fields.find(field => nextErrors[field.name])?.name
    if (name) (form.elements.namedItem(name) as HTMLElement | null)?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      focusInvalidField(event.currentTarget, nextErrors)
      return
    }
    if (!contactService.available) return
    sending.current = true
    setStatus('sending')
    try {
      await contactService.send({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim() })
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      sending.current = false
    }
  }

  return (
    <section id="contato" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Vamos conversar?</h2>
      <div className="contact-panel">
        <div className="contact-introduction">
          <p>Uma ideia, uma oportunidade ou um novo projeto.</p>
          <ArrowUpRight className="contact-decoration" aria-hidden="true" strokeWidth={0.75} />
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'} aria-describedby={!contactService.available ? 'contact-unavailable' : undefined}>
          {fields.map(field => {
            const error = errors[field.name]
            const common = {
              id: `contact-${field.name}`,
              name: field.name,
              required: true,
              value: values[field.name],
              disabled: status === 'sending',
              'aria-invalid': !!error,
              'aria-describedby': error ? `contact-${field.name}-error` : undefined,
              onBlur: () => validateField(field.name),
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field.name, event.target.value),
            }
            return (
              <div className="contact-field" key={field.name}>
                <label htmlFor={common.id}>{field.label}</label>
                {field.name === 'message' ? <textarea {...common} rows={4} /> : <input {...common} type={field.type} autoComplete={field.autoComplete} />}
                {error && <p className="contact-field-error" id={`contact-${field.name}-error`} role="alert">{error}</p>}
              </div>
            )
          })}
          {!contactService.available && <p id="contact-unavailable" className="contact-notice">O envio de mensagens ainda não está disponível.</p>}
          <button className="contact-submit" type="submit" disabled={!contactService.available || status === 'sending'}>
            {status === 'sending' ? 'Enviando mensagem' : 'Enviar mensagem'}<ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <p className="contact-status" role="status" aria-live="polite" aria-atomic="true">
            {status === 'sending' && 'Enviando sua mensagem…'}
            {status === 'success' && 'Mensagem enviada com sucesso.'}
            {status === 'error' && 'Não foi possível enviar. Seus dados foram preservados; tente novamente.'}
          </p>
        </form>
      </div>
    </section>
  )
}
