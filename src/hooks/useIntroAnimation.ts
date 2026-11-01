import { useLayoutEffect } from 'react'
import { animate } from 'motion'

export function useIntroAnimation() {
  useLayoutEffect(() => {
    const hero = document.getElementById('sobre')
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!hero || preference.matches) return
    const characters = Array.from(hero.querySelectorAll<HTMLElement>('.typing-character'))
    const targets = [
      document.querySelector<HTMLElement>('header'), hero.querySelector<HTMLElement>('.eyebrow'),
      hero.querySelector<HTMLElement>('h1'), hero.querySelector<HTMLElement>('.description'),
      hero.querySelector<HTMLElement>('.contact-button'), hero.querySelector<HTMLElement>('.cursor-container'),
    ].filter((element): element is HTMLElement => !!element)
    const original = targets.map(element => ({ opacity: element.style.opacity, transform: element.style.transform }))
    const controls: { stop: () => void }[] = []
    const timers: number[] = []
    let observer: IntersectionObserver | undefined
    let alive = true
    let started = false
    let finished = false
    const showTarget = (element: HTMLElement, index: number) => {
      element.style.opacity = original[index].opacity
      element.style.transform = original[index].transform
    }
    const finish = () => {
      finished = true
      observer?.disconnect()
      timers.forEach(window.clearTimeout)
      controls.forEach(control => control.stop())
      targets.forEach(showTarget)
      hero.classList.remove('is-typing')
      hero.removeAttribute('data-intro-pending')
      characters.forEach(character => {
        character.style.removeProperty('visibility')
        character.classList.remove('typing-current')
      })
    }
    const start = () => {
      if (started || finished || !alive || preference.matches) return
      started = true
      observer?.disconnect()
      try {
        hero.classList.add('is-typing')
        hero.dataset.introPending = 'true'
        targets.forEach((element, index) => {
          element.style.opacity = '0'
          const control = animate(element, { opacity: [0, 1], y: [12, 0] }, {
            delay: index * 0.12, duration: 0.55, ease: [0.2, 0.65, 0.3, 1],
          })
          controls.push(control)
          void control.then(() => {
            if (!alive || finished) return
            showTarget(element, index)
            if (element.classList.contains('cursor-container')) hero.removeAttribute('data-intro-pending')
          })
        })
        characters.forEach((character, index) => {
          timers.push(window.setTimeout(() => {
            if (!alive || finished) return
            characters.forEach(item => item.classList.remove('typing-current'))
            character.style.visibility = 'visible'
            if (index < characters.length - 1) character.classList.add('typing-current')
            else finish()
          }, 240 + (index + 1) * 1200 / characters.length))
        })
      } catch (error) {
        console.error('Falha ao iniciar a introdução do portfólio:', error)
        finish()
      }
    }

    // Restored scroll and old URL hashes must not permanently disable the intro.
    // Play once when the actual hero content becomes visible; never reposition the page.
    const content = hero.querySelector('.hero-copy') ?? hero
    const bounds = content.getBoundingClientRect()
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 80
    const visibleHeight = Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, headerHeight)
    if (visibleHeight >= Math.min(bounds.height * 0.15, window.innerHeight * 0.15)) {
      start()
    } else if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(entries => {
        const entry = entries[0]
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) start()
      }, { threshold: 0.15 })
      observer.observe(content)
    }

    const onPreference = () => { if (preference.matches) finish() }
    const onFocus = (event: FocusEvent) => {
      targets.forEach((element, index) => {
        if (event.target instanceof Node && element.contains(event.target)) {
          controls[index]?.stop()
          showTarget(element, index)
        }
      })
    }
    preference.addEventListener('change', onPreference)
    document.addEventListener('focusin', onFocus)
    return () => {
      alive = false
      finish()
      preference.removeEventListener('change', onPreference)
      document.removeEventListener('focusin', onFocus)
    }
  }, [])
}
