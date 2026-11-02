import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import logoUrl from '../assets/branding/logo.png'

const navigation = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'contato', label: 'Contato' },
]

export function Header({ themeControl }: { themeControl: ReactNode }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0)
  const [activeSection, setActiveSection] = useState('sobre')
  const headerRef = useRef<HTMLElement>(null)

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
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(trackingFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  return (
    <header ref={headerRef} className={`header page-shell grid items-center${scrolled ? ' header-scrolled' : ''}`}>
      <a className="wordmark" href="#sobre" aria-label="Leonardo Orphali — início"><span className="brand-logo"><img src={logoUrl} alt="" width="1536" height="1024" /></span></a>
      <nav className="navigation flex items-center" aria-label="Navegação principal">
        {navigation.map(({ id, label }) => (
          <a key={id} className={`nav-item${activeSection === id ? ' active' : ''}`} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>
        ))}
      </nav>
      <div className="header-tools">{themeControl}</div>
    </header>
  )
}
