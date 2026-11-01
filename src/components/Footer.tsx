import './Footer.css'
import { ContactLinks } from './ContactLinks'

export function Footer() {
  return (
    <footer className="footer page-shell">
      <div className="footer-content">
        <span>Leonardo Orphali</span>
        <ContactLinks />
        <span>São Paulo, Brasil</span>
      </div>
    </footer>
  )
}
