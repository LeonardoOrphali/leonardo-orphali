import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import logoUrl from '../assets/branding/logo.png'
import './Header.css'

const navigation = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'contato', label: 'Contato' },
]

export function Header({ themeControl }: { themeControl: ReactNode }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0)
  const [activeSection, setActiveSection] = useState('sobre')
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)

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

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1001px)')
    const onBreakpoint = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener('change', onBreakpoint)
    return () => desktop.removeEventListener('change', onBreakpoint)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector('a')?.focus({ preventScroll: true })
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButton.current?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  return (
    <header ref={headerRef} className={`header page-shell grid items-center${scrolled ? ' header-scrolled' : ''}${menuOpen ? ' header-menu-open' : ''}`} onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
    }}>
      <a className="wordmark" href="#sobre" aria-label="Leonardo Orphali — início" onClick={() => setMenuOpen(false)}><span className="brand-logo"><img src={logoUrl} alt="" width="1536" height="1024" /></span></a>
      <button className="header-menu-backdrop" type="button" hidden={!menuOpen} tabIndex={-1} aria-label="Fechar menu" onClick={() => {
        setMenuOpen(false)
        menuButton.current?.focus({ preventScroll: true })
      }} />
      <nav ref={menuRef} id="header-navigation" className={`navigation flex items-center${menuOpen ? ' is-open' : ''}`} aria-label="Navegação principal">
        {navigation.map(({ id, label }) => (
          <a key={id} className={`nav-item${activeSection === id ? ' active' : ''}`} href={`#${id}`} onClick={() => setMenuOpen(false)} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>
        ))}
      </nav>
      <div className="header-tools">
        {themeControl}
        <button ref={menuButton} className="header-menu-toggle" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="header-navigation" onClick={() => setMenuOpen(value => !value)}>
          {menuOpen ? <X size={28} strokeWidth={1.8} aria-hidden="true" /> : <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false"><path d="M4 8h20M4 20h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
        </button>
      </div>
    </header>
  )
}
