import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import './ContactToast.css'

export type ContactNotification = { id: number; kind: 'success' | 'error'; message: string }
type Props = { notification: ContactNotification | null; onDismiss: () => void }

export function ContactToast({ notification, onDismiss }: Props) {
  const toastRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = toastRef.current
    if (!notification || !element) return
    // Success stays for 5 seconds; longer error messages get 8 seconds of reading time.
    const duration = notification.kind === 'success' ? 5000 : 8000
    let remaining = duration
    const progress = progressRef.current?.animate([
      { transform: 'scaleX(1)' }, { transform: 'scaleX(0)' },
    ], { duration, easing: 'linear', fill: 'forwards' })
    progress?.pause()
    let startedAt = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const paused = new Set<string>()
    if (element.matches(':hover')) paused.add('hover')
    if (element.contains(document.activeElement)) paused.add('focus')
    if (document.hidden) paused.add('hidden')

    const start = () => {
      if (paused.size || timer !== undefined) return
      startedAt = performance.now()
      if (progress) {
        progress.currentTime = duration - remaining
        progress.play()
      }
      timer = setTimeout(onDismiss, remaining)
    }
    const pause = (reason: string) => {
      paused.add(reason)
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
      remaining = Math.max(0, remaining - (performance.now() - startedAt))
      progress?.pause()
      if (progress) progress.currentTime = duration - remaining
    }
    const resume = (reason: string) => { paused.delete(reason); start() }
    const onEnter = () => pause('hover')
    const onLeave = () => resume('hover')
    const onFocus = () => pause('focus')
    const onBlur = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) resume('focus')
    }
    const onVisibility = () => { if (document.hidden) pause('hidden'); else resume('hidden') }
    element.addEventListener('mouseenter', onEnter)
    element.addEventListener('mouseleave', onLeave)
    element.addEventListener('focusin', onFocus)
    element.addEventListener('focusout', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    start()
    return () => {
      clearTimeout(timer)
      progress?.cancel()
      element.removeEventListener('mouseenter', onEnter)
      element.removeEventListener('mouseleave', onLeave)
      element.removeEventListener('focusin', onFocus)
      element.removeEventListener('focusout', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [notification, onDismiss])

  return createPortal(
    <div className="contact-toast-region" role="status" aria-live="polite" aria-atomic="true">
      {notification && (
        <div className="contact-toast" ref={toastRef} key={notification.id}>
          {notification.kind === 'success' ? <CheckCircle2 className="contact-toast-icon" size={22} aria-hidden="true" /> : <CircleAlert className="contact-toast-icon" size={22} aria-hidden="true" />}
          <div className="contact-toast-message">
            {notification.kind === 'error' && <p className="contact-toast-title">Não foi possível enviar</p>}
            <p>{notification.message}</p>
          </div>
          <button type="button" className="contact-toast-close" onClick={onDismiss} aria-label="Fechar notificação"><X size={18} aria-hidden="true" /></button>
          <span className="contact-toast-progress-track" aria-hidden="true"><span className="contact-toast-progress" ref={progressRef} /></span>
        </div>
      )}
    </div>,
    document.body,
  )
}
