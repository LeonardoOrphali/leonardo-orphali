import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Globe, X } from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { projects } from '../data/projects'
import { ProjectTechnologies } from './ProjectTechnologies'
import './Projects.css'

const glitchColors = ['#3b82f6', '#a5d8ff', '#38bdf8']
const LetterGlitch = lazy(() => import('./LetterGlitch'))

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const [showAccents, setShowAccents] = useState(false)
  const [preview, setPreview] = useState<(typeof projects)[number] | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      setShowAccents(true)
      observer.disconnect()
    }, { rootMargin: '200px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  function closePreview() {
    const dialog = dialogRef.current
    if (!dialog?.open || closeTimer.current !== null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.close()
      return
    }
    dialog.classList.add('is-closing')
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      dialog.close()
    }, 180)
  }

  useEffect(() => {
    if (!preview || !dialogRef.current) return
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog.classList.remove('is-closing')
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (closeTimer.current !== null) clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [preview])

  return (
    <section ref={sectionRef} id="projetos" className="projects" aria-labelledby="projects-title">
      <div className="projects-accents" aria-hidden="true">
        <Suspense fallback={null}>
          {showAccents && ['start', 'end'].map(position => (
            <div className={`projects-accent projects-accent-${position}`} key={position}>
              <LetterGlitch glitchColors={glitchColors} baseColor="#7fa7cb" baseOpacity={0.65} density={0.8} glitchAmount={0.1} speed={0.6} fontSize={13} edgeFade={0.08} centerFade={0} intro={false} interactive={false} clickEffect="none" dpr={1} />
            </div>
          ))}
        </Suspense>
      </div>
      <h2 id="projects-title">Projetos em destaque</h2>
      <div className="project-list">
        {projects.filter(project => !project.hidden).map((project, index) => (
          <article className={`project${index % 2 ? ' project-reversed' : ''}`} aria-labelledby={`${project.id}-title`} key={project.id}>
            <div className="project-heading">
              <h3 id={`${project.id}-title`}>{project.title}</h3>
            </div>
            <div className={`project-media${project.image.placeholder ? ' project-placeholder' : ''}`}>
              {project.image.placeholder ? (
                <img src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} loading="lazy" decoding="async" />
              ) : (
                <button className="project-preview-trigger" onClick={() => setPreview(project)} aria-label={`Ampliar captura do ${project.title}`} aria-haspopup="dialog">
                  <img src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} loading="lazy" decoding="async" />
                </button>
              )}
            </div>
            <div className="project-copy">
              <div className="project-copy-reserve" aria-hidden="true">
                <div className="project-details">
                  <p className="project-description">{project.description}</p>
                  <p className={`project-technologies${project.expandableTechnologies ? ' technology-summary' : ''}`}>{project.technologies}</p>
                </div>
                <div className="project-actions-reserve" />
              </div>
              <div className="project-copy-content">
                <div className="project-details">
                  <p className="project-description">{project.description}</p>
                  <ProjectTechnologies technologies={project.technologies} expandable={project.expandableTechnologies} />
                </div>
                <div className="project-actions">
                  {[
                    { label: 'Ver projeto', url: project.projectUrl },
                    { label: 'GitHub', url: project.githubUrl },
                  ].map(({ label, url }) => url ? (
                    <a href={url} key={label} target="_blank" rel="noopener noreferrer" title={`${label} — ${project.title}`} aria-label={`${label} — ${project.title} (abre em nova aba)`}>
                      {label === 'GitHub' ? <GithubIcon /> : <Globe size={23} aria-hidden="true" />}
                    </a>
                  ) : (
                    <button disabled key={label} title={`${label} (em breve)`} aria-label={`${label} — ${project.title} (em breve)`}>
                      {label === 'GitHub' ? <GithubIcon /> : <Globe size={23} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
                  </div>
            </div>
          </article>
        ))}
      </div>
      <dialog ref={dialogRef} className="project-lightbox" aria-labelledby="project-preview-title" onClose={() => setPreview(null)} onCancel={event => { event.preventDefault(); closePreview() }} onClick={event => {
        if (event.target === event.currentTarget) closePreview()
      }}>
        {preview && <>
          <h2 id="project-preview-title" className="sr-only">Captura completa do {preview.title}</h2>
          <button className="project-lightbox-close" type="button" onClick={closePreview} aria-label="Fechar imagem ampliada" autoFocus><X size={26} aria-hidden="true" /></button>
          <div className="project-lightbox-content">
            <img className="project-lightbox-image" src={preview.image.src} alt={preview.image.alt} width={preview.image.width} height={preview.image.height} decoding="async" />
            {preview.projectUrl ? (
              <a className="project-lightbox-visit" href={preview.projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visitar site do ${preview.title} (abre em nova aba)`}>Visitar site</a>
            ) : <button className="project-lightbox-visit" disabled>Visitar site</button>}
          </div>
        </>}
      </dialog>
    </section>
  )
}
