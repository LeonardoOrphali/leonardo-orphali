import { Mail } from 'lucide-react'
import { contactLinks } from '../data/contact'
import { GithubIcon } from './GithubIcon'

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.75 1.36-1.55 2.8-1.55 3 0 3.57 1.97 3.57 4.53v5.27Z" />
    </svg>
  )
}

const icons = [Mail, LinkedInIcon, GithubIcon]

export function ContactLinks() {
  return (
    <div className="social-links" role="group" aria-label="Outras formas de contato">
      {contactLinks.map(({ label, url, external }, index) => {
        const Icon = icons[index]
        return url ? (
          <a className="social-link" key={label} href={url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} title={label} aria-label={`${label}${external ? ' (abre em nova aba)' : ''}`}><Icon aria-hidden="true" /></a>
        ) : (
          <button className="social-link" key={label} disabled title={`${label} (em breve)`} aria-label={`${label} (em breve)`}><Icon aria-hidden="true" /></button>
        )
      })}
    </div>
  )
}
