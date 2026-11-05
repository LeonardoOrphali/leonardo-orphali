import './Footer.css'
import { ContactLinks } from './ContactLinks'

export function Footer() {
  return (
    <footer className="footer page-shell">
      <div className="footer-content">
        <span className="footer-name">Leonardo Orphali</span>
        <ContactLinks />
        <span className="footer-separator" aria-hidden="true">•</span>
        <span className="footer-location">São Paulo, Brasil</span>
      </div>
    </footer>
  )
}
