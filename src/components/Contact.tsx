import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { CONTACT_LIMITS, ContactError, contactService, validateContact } from '../services/contact'
import type { ContactErrors, ContactValues } from '../services/contact'
import { ContactToast } from './ContactToast'
import type { ContactNotification } from './ContactToast'
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
  const request = useRef<AbortController | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const [notification, setNotification] = useState<ContactNotification | null>(null)
  const notificationId = useRef(0)
  const dismissNotification = useCallback(() => setNotification(null), [])
  function notify(message: string, kind: ContactNotification['kind']) {
    setNotification({ id: ++notificationId.current, kind, message })
  }

  useEffect(() => () => {
    const active = request.current
    request.current = null
    active?.abort()
  }, [])

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
      notify('Confira os campos indicados antes de enviar sua mensagem.', 'error')
      focusInvalidField(event.currentTarget, nextErrors)
      return
    }
    if (!contactService.available) {
      setStatus('error')
      notify('O envio está indisponível no momento. Tente novamente mais tarde.', 'error')
      return
    }
    const controller = new AbortController()
    request.current = controller
    sending.current = true
    setNotification(null)
    setStatus('sending')
    const form = event.currentTarget
    try {
      await contactService.send(values, { signal: controller.signal, honeypot: honeypot.current?.value ?? '' })
      if (request.current !== controller) return
      setValues({ name: '', email: '', message: '' })
      setErrors({})
      if (honeypot.current) honeypot.current.value = ''
      setStatus('success')
      notify('Mensagem enviada com sucesso.', 'success')
    } catch (error) {
      if (request.current !== controller) return
      if (error instanceof ContactError) {
        notify(error.message, 'error')
        setErrors(error.fields)
        if (Object.keys(error.fields).length) focusInvalidField(form, error.fields)
      } else {
        notify('Não foi possível enviar. Seus dados foram preservados; tente novamente.', 'error')
      }
      setStatus('error')
    } finally {
      if (request.current === controller) request.current = null
      sending.current = false
    }
  }

  return (
    <section id="contato" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Entre em contato</h2>
      <div className="contact-panel">
        <div className="contact-introduction">
          <p>Vamos conversar sobre como posso contribuir com sua equipe.</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'} aria-describedby={!contactService.available ? 'contact-unavailable' : undefined}>
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="contact-gotcha">Deixe este campo vazio</label>
            <input id="contact-gotcha" name="_gotcha" type="text" ref={honeypot} tabIndex={-1} autoComplete="off" />
          </div>
          {fields.map(field => {
            const error = errors[field.name]
            const common = {
              id: `contact-${field.name}`,
              name: field.name,
              required: true,
              maxLength: CONTACT_LIMITS[field.name],
              value: values[field.name],
              readOnly: status === 'sending',
              'aria-invalid': !!error,
              'aria-describedby': error ? `contact-${field.name}-error` : undefined,
              onBlur: () => validateField(field.name),
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field.name, event.target.value),
            }
            return (
              <div className="contact-field" key={field.name}>
                <label htmlFor={common.id}>{field.label}</label>
                {field.name === 'message' ? <textarea {...common} rows={4} /> : <input {...common} type={field.type} autoComplete={field.autoComplete} />}
                <p className="contact-field-error" id={`contact-${field.name}-error`} role="alert" aria-atomic="true">{error ?? ''}</p>
              </div>
            )
          })}
          {!contactService.available && <p id="contact-unavailable" className="contact-notice">O envio de mensagens ainda não está disponível.</p>}
          <div className="contact-form-actions">
            <button className="contact-submit" type="submit" disabled={!contactService.available || status === 'sending'}>Enviar mensagem</button>
            <p className="contact-sending-status" aria-hidden="true">{status === 'sending' ? 'Enviando…' : ''}</p>
          </div>

        </form>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status === 'sending' ? 'Enviando sua mensagem…' : ''}</p>
      <ContactToast notification={notification} onDismiss={dismissNotification} />
    </section>
  )
}
