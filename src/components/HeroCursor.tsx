import { useEffect, useRef } from 'react'
import { motion, useSpring } from 'motion/react'
import { observeMotion } from '../utils/observeMotion'

const spring = { stiffness: 110, damping: 22, mass: 0.8 }

export function HeroCursor() {
  const container = useRef<HTMLDivElement>(null)
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  const rotate = useSpring(0, spring)

  useEffect(() => {
    const element = container.current
    const section = element?.closest('section')
    if (!element || !section) return
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let enabled = false
    const reset = (immediate = false) => {
      for (const value of [x, y, rotate]) {
        if (immediate) value.jump(0)
        else value.set(0)
      }
    }
    const move = (event: PointerEvent) => {
      if (!enabled || !pointer.matches || event.pointerType === 'touch') return
      const bounds = section.getBoundingClientRect()
      const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
      const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
      x.set(horizontal * 12)
      y.set(vertical * 12)
      rotate.set(horizontal * 6)
    }
    const leave = () => reset()
    const pointerChanged = () => reset(true)
    const stop = observeMotion(section, (active) => {
      enabled = active
      if (!active) reset(true)
    })
    section.addEventListener('pointermove', move)
    section.addEventListener('pointerleave', leave)
    pointer.addEventListener('change', pointerChanged)
    return () => {
      stop()
      reset(true)
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      pointer.removeEventListener('change', pointerChanged)
    }
  }, [x, y, rotate])

  return (
    <div ref={container} className="cursor-container flex items-center justify-center" aria-hidden="true">
      <motion.div style={{ x, y, rotate }}>
        <div className="cursor-float">
          <svg className="hero-cursor" viewBox="0 0 180 200" fill="none" focusable="false">
            <path d="M16 11C9 7 3 12 6 20L51 167C53 175 61 177 65 169L87 128L132 181C136 186 141 187 146 182L159 169C164 164 164 159 159 154L114 104L159 91C168 88 168 80 160 76L16 11Z" fill="currentColor" />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
