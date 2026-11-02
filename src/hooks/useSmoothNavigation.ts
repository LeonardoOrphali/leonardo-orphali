import { useEffect } from 'react'

export function useSmoothNavigation() {
  useEffect(() => {
    let frame = 0
    const cancel = () => cancelAnimationFrame(frame)
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel()
    }
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a.nav-item, a.wordmark, a.contact-button')
      const href = link?.getAttribute('href')
      if (!href?.startsWith('#')) return
      const section = document.getElementById(href.slice(1))
      if (!section) return
      event.preventDefault()
      cancel()
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 80
      const start = window.scrollY
      const destination = Math.max(0, Math.min(
        start + section.getBoundingClientRect().top - headerHeight - 16,
        document.documentElement.scrollHeight - window.innerHeight,
      ))
      if (window.location.hash !== href) window.history.pushState(null, '', href)
      const focusSection = () => {
        const previous = section.getAttribute('tabindex')
        section.tabIndex = -1
        section.focus({ preventScroll: true })
        if (previous === null) section.removeAttribute('tabindex')
        else section.setAttribute('tabindex', previous)
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo({ top: destination, behavior: 'instant' })
        focusSection()
        return
      }
      const startedAt = performance.now()
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 500, 1)
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
        window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' })
        if (progress < 1) frame = requestAnimationFrame(animate)
        else focusSection()
      }
      frame = requestAnimationFrame(animate)
    }
    document.addEventListener('click', onClick)
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      cancel()
      document.removeEventListener('click', onClick)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
}
