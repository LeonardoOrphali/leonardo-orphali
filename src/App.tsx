import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Header } from './components/Header'
import { Technologies } from './components/Technologies'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import GradientASCII from './components/GradientASCII'
import { IntroTitle } from './components/IntroTitle'
import { useSectionEntrance } from './hooks/useSectionEntrance'
import { useIntroAnimation } from './hooks/useIntroAnimation'
import { useSmoothNavigation } from './hooks/useSmoothNavigation'

const heroColors = ['#3b82f6', '#f6f8ff', '#a5d8ff', '#38bdf8']
const lightHeroColors = ['#365eab', '#f7f9fc', '#dde8fa', '#8fb4e8']

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
      <main>
        <section id="sobre" className="hero grid items-center" aria-labelledby="intro-title">
          <div className="hero-background" aria-hidden="true">
            <GradientASCII
              colors={theme === 'light' ? lightHeroColors : heroColors}
              lightMode={theme === 'light'}
              gradientOpacity={theme === 'light' ? 0.4 : 0.9}
              glyphOpacity={theme === 'light' ? 0.6 : 0.85}
              density={theme === 'light' ? 0.7 : 0.8}
              grain={theme === 'light' ? 0.025 : 0.08}
              dpr={1}
              mouseInteraction={false}
              clickEffect="none"
            />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Leonardo Orphali</p>
            <IntroTitle />
            <a className="contact-button inline-flex items-center justify-center" href="#contato">Vamos conversar</a>
          </div>
        </section>
        <div className="page-shell">
          <Technologies />
          <Projects />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  )
}
