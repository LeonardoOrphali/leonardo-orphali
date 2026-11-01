export function observeMotion(element: HTMLElement, onChange: (active: boolean, reduced: boolean) => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  let visible = false
  const update = () => {
    const active = visible && !document.hidden && !preference.matches
    element.dataset.motionActive = String(active)
    onChange(active, preference.matches)
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    update()
  })
  observer.observe(element)
  preference.addEventListener('change', update)
  document.addEventListener('visibilitychange', update)
  update()
  return () => {
    observer.disconnect()
    preference.removeEventListener('change', update)
    document.removeEventListener('visibilitychange', update)
  }
}
