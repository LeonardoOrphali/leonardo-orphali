import { useLayoutEffect } from 'react'
import { animate } from 'motion'

// Scroll reveals repeat on re-entry. The footer deliberately remains static.
export function useSectionEntrance() {
  useLayoutEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || typeof IntersectionObserver !== 'function') return
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('.objective, .technology-composition, .projects > h2, .project, .contact > h2, .contact-panel'))
    const original = new Map(blocks.map(element => [element, { opacity: element.style.opacity, transform: element.style.transform }]))
    const pending = new Set<HTMLElement>()
    const playback = new Map<HTMLElement, { stop: () => void }>()
    let alive = true
    let observer: IntersectionObserver | undefined
    const show = (element: HTMLElement) => {
      playback.get(element)?.stop()
      playback.delete(element)
      const styles = original.get(element)
      if (styles) { element.style.opacity = styles.opacity; element.style.transform = styles.transform }
      pending.delete(element)
    }
    const hide = (element: HTMLElement) => {
      if (element.contains(document.activeElement)) return
      show(element)
      pending.add(element)
      element.style.opacity = '0'
    }
    const showAll = () => { observer?.disconnect(); blocks.forEach(show) }
    try {
      observer = new IntersectionObserver(entries => {
        let stagger = 0
        for (const entry of entries) {
          const element = entry.target as HTMLElement
          if (!entry.isIntersecting) { hide(element); continue }
          const required = Math.min(entry.boundingClientRect.height * 0.15, window.innerHeight * 0.15)
          if (!pending.has(element) || entry.intersectionRect.height < required) continue
          pending.delete(element)
          try {
            const control = animate(element, { opacity: [0, 1], y: [18, 0] }, {
              duration: 0.55, delay: Math.min(stagger++ * 0.1, 0.15), ease: [0.2, 0.65, 0.3, 1],
            })
            playback.set(element, control)
            void control.then(() => { if (alive && playback.get(element) === control) show(element) })
          } catch { show(element) }
        }
      }, { threshold: Array.from({ length: 16 }, (_, index) => index / 100) })
      blocks.forEach(element => {
        const rect = element.getBoundingClientRect()
        if (rect.top >= window.innerHeight) hide(element)
        observer?.observe(element)
      })
    } catch { showAll() }
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node) blocks.forEach(element => { if (element.contains(event.target as Node)) show(element) })
    }
    const onPreference = () => { if (preference.matches) showAll() }
    document.addEventListener('focusin', onFocus)
    preference.addEventListener('change', onPreference)
    return () => {
      alive = false
      showAll()
      document.removeEventListener('focusin', onFocus)
      preference.removeEventListener('change', onPreference)
    }
  }, [])
}
