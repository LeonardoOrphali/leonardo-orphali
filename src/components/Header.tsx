import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

const navigation = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'contato', label: 'Contato' },
]

export function Header({ themeControl }: { themeControl: ReactNode }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0)
  const [activeSection, setActiveSection] = useState('sobre')
  const headerRef = useRef<HTMLElement>(null)
  const animationRef = useRef(0)

  useEffect(() => {
    let trackingFrame = 0
    const updatePosition = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 80
      const threshold = headerHeight + Math.min(window.innerHeight * 0.25, 160)
      let current = 'sobre'
      for (const { id } of navigation) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= threshold) current = id
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'contato'
      setScrolled(window.scrollY > 0)
      setActiveSection(current)
    }
    const scheduleUpdate = () => {
      cancelAnimationFrame(trackingFrame)
      trackingFrame = requestAnimationFrame(updatePosition)
    }
    const cancelScroll = () => cancelAnimationFrame(animationRef.current)
    const handleKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelScroll()
    }
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('wheel', cancelScroll, { passive: true })
    window.addEventListener('touchstart', cancelScroll, { passive: true })
    window.addEventListener('keydown', handleKey)
    return () => {
      cancelAnimationFrame(trackingFrame)
      cancelScroll()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('wheel', cancelScroll)
      window.removeEventListener('touchstart', cancelScroll)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  function navigateTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const section = document.getElementById(id)
    if (!section) return
    event.preventDefault()
    cancelAnimationFrame(animationRef.current)
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 80
    const start = window.scrollY
    const destination = Math.max(0, Math.min(
      start + section.getBoundingClientRect().top - headerHeight - 16,
      document.documentElement.scrollHeight - window.innerHeight,
    ))
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`)
    const focusSection = () => {
      const previousTabIndex = section.getAttribute('tabindex')
      section.tabIndex = -1
      section.focus({ preventScroll: true })
      if (previousTabIndex === null) section.removeAttribute('tabindex')
      else section.setAttribute('tabindex', previousTabIndex)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: destination, behavior: 'instant' })
      focusSection()
      return
    }
    const startedAt = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 500, 1)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' })
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
      else focusSection()
    }
    animationRef.current = requestAnimationFrame(animate)
  }

  return (
    <header ref={headerRef} className={`header page-shell grid items-center${scrolled ? ' header-scrolled' : ''}`}>
      <a className="wordmark" href="#sobre" onClick={event => navigateTo(event, 'sobre')} aria-label="Leonardo Orphali — início"><span className="brand-logo"><img src="/logo.png" alt="" width="1536" height="1024" /></span></a>
      <nav className="navigation flex items-center" aria-label="Navegação principal">
        {navigation.map(({ id, label }) => (
          <a key={id} className={`nav-item${activeSection === id ? ' active' : ''}`} href={`#${id}`} onClick={event => navigateTo(event, id)} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>
        ))}
      </nav>
      <div className="header-tools">{themeControl}</div>
    </header>
  )
}
