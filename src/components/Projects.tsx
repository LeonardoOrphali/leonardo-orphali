import { Globe } from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { projects } from '../data/projects'
import './Projects.css'

export function Projects() {
  return (
    <section id="projetos" className="projects" aria-labelledby="projects-title">
      <h2 id="projects-title">Projetos selecionados</h2>
      <div className="project-list">
        {projects.map((project, index) => (
          <article className={`project${index % 2 ? ' project-reversed' : ''}`} aria-labelledby={`${project.id}-title`} key={project.id}>
            <div className="project-heading">
              <h3 id={`${project.id}-title`}>{project.title}</h3>
            </div>
            <div className={`project-media${project.image.placeholder ? ' project-placeholder' : ''}`}>
              <img src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} loading="lazy" decoding="async" />
            </div>
            <p className="project-description">{project.description}</p>
            <p className="project-technologies">{project.technologies}</p>
            <div className="project-actions">
              {[
                { label: 'Ver projeto', url: project.projectUrl },
                { label: 'GitHub', url: project.githubUrl },
              ].map(({ label, url }) => url ? (
                <a href={url} key={label} aria-label={`${label} — ${project.title}`}>
                  {label === 'GitHub' ? <GithubIcon /> : <Globe size={23} aria-hidden="true" />}
                </a>
              ) : (
                <button disabled key={label} title={`${label} (em breve)`} aria-label={`${label} — ${project.title} (em breve)`}>
                  {label === 'GitHub' ? <GithubIcon /> : <Globe size={23} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
