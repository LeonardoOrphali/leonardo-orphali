import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Header } from './components/Header'
import { Technologies } from './components/Technologies'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { HeroCursor } from './components/HeroCursor'
import { IntroTitle } from './components/IntroTitle'
import { useSectionEntrance } from './hooks/useSectionEntrance'
import { useIntroAnimation } from './hooks/useIntroAnimation'
import { useSmoothNavigation } from './hooks/useSmoothNavigation'

export default function App() {
  useSmoothNavigation()
  useIntroAnimation()
  useSectionEntrance()
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
    try { localStorage.setItem('theme', next) } catch { /* A escolha funciona mesmo sem armazenamento. */ }
  }

  return (
    <>
      <a className="skip-link" href="#sobre">Pular para o conteúdo</a>
      <Header themeControl={
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
          {theme === 'dark' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
        </button>
      } />
      <main className="page-shell">
        <section id="sobre" className="hero grid items-center" aria-labelledby="intro-title">
          <div className="hero-copy">
            <p className="eyebrow">Leonardo Orphali</p>
            <IntroTitle />
            <p className="description">Desenvolvo aplicações web com React, Next.js, TS e C#/.NET, unindo interfaces intuitivas e soluções bem estruturadas.</p>
            <a className="contact-button inline-flex items-center justify-center" href="#contato">Vamos conversar</a>
          </div>
          <HeroCursor />
        </section>
        <Technologies />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
