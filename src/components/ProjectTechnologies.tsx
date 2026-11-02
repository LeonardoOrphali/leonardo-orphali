import { useId, useLayoutEffect, useRef, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'

type Props = { technologies: string; expandable?: boolean }

export function ProjectTechnologies({ technologies, expandable = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const regionId = useId()
  const disclosureRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const root = disclosureRef.current
    const list = listRef.current
    if (!root || !list) return
    const measure = () => {
      root.style.setProperty('--technology-full-height', `${Math.ceil(list.getBoundingClientRect().height)}px`)
      const range = document.createRange()
      list.querySelectorAll<HTMLElement>('.technology-separator').forEach(separator => {
        const before = separator.previousElementSibling?.firstChild
        const after = separator.nextElementSibling?.firstChild
        if (!before || !after || !before.textContent?.length || !after.textContent?.length) return
        range.setStart(before, before.textContent.length - 1)
        range.setEnd(before, before.textContent.length)
        const beforeTop = range.getBoundingClientRect().top
        range.setStart(after, 0)
        range.setEnd(after, 1)
        const afterTop = range.getBoundingClientRect().top
        separator.style.removeProperty('visibility')
        separator.textContent = Math.abs(beforeTop - afterTop) < 2 ? ' • ' : ' '
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])
  if (!expandable) return <p className="project-technologies">{technologies}</p>
  const items = technologies.split(' · ')
  return (
    <div ref={disclosureRef} className={`project-technologies technology-disclosure${expanded ? ' is-expanded' : ''}`}>
      <button className="technology-disclosure-header" type="button" aria-expanded={expanded} aria-controls={regionId} aria-label={expanded ? 'Recolher tecnologias do projeto' : 'Mostrar todas as tecnologias do projeto'} onClick={() => setExpanded(value => !value)}>
        <ChevronDown className="technology-disclosure-arrow" size={18} aria-hidden="true" />
        <span className="technology-disclosure-content" id={regionId}>
          <span className="technology-disclosure-inner">
            <span ref={listRef} className="technology-full-list">
              {items.map((item, index) => <Fragment key={item}>
                <span className="technology-list-item">{item}</span>
                {index < items.length - 1 && <span className="technology-separator" aria-hidden="true">{' • '}</span>}
              </Fragment>)}
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
