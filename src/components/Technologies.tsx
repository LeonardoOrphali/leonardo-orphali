import type { CSSProperties } from 'react'
import './Technologies.css'
import { useEffect, useRef } from 'react'
import { observeMotion } from '../utils/observeMotion'
import react from '../assets/technologies/react.svg'
import nextjs from '../assets/technologies/nextjs.svg'
import typescript from '../assets/technologies/typescript.svg'
import javascript from '../assets/technologies/javascript.svg'
import css from '../assets/technologies/css3.svg'
import tailwind from '../assets/technologies/tailwindcss.svg'
import csharp from '../assets/technologies/csharp.svg'
import dotnet from '../assets/technologies/dot-net.svg'
import git from '../assets/technologies/git.svg'
import docker from '../assets/technologies/docker.svg'
import vitest from '../assets/technologies/vitest.svg'
import sqlserver from '../assets/technologies/microsoftsqlserver.svg'
import postgresql from '../assets/technologies/postgresql.svg'
import mongodb from '../assets/technologies/mongodb.svg'

const rows = [
  [
    { name: 'React', icon: react },
    { name: 'Next.js', icon: nextjs },
    { name: 'TypeScript', icon: typescript },
    { name: 'JavaScript', icon: javascript },
    { name: 'CSS', icon: css },
    { name: 'Tailwind CSS', icon: tailwind },
    { name: 'C#', icon: csharp },
  ],
  [
    { name: '.NET', icon: dotnet },
    { name: 'Git', icon: git },
    { name: 'Docker', icon: docker },
    { name: 'Vitest', icon: vitest },
    { name: 'SQL Server', icon: sqlserver },
    { name: 'PostgreSQL', icon: postgresql },
    { name: 'MongoDB', icon: mongodb },
  ],
]

// All coordinates share the 600 × 360 canvas with the HTML icon grid.
// The seven curves begin at the bottom edge of the lower row (y = 106).
const connectionStarts = [120, 180, 240, 300, 360, 420, 480]

const orbitRadii = [[115, 24], [150, 33], [185, 43], [245, 57]]
const planets = [
  { orbit: 2, duration: 37, phase: 0.39, radius: 5 },
  { orbit: 1, duration: 29, phase: 0.62, radius: 2.2 },
  { orbit: 0, duration: 25, phase: 0.02, radius: 2 },
  { orbit: 3, duration: 50, phase: 0.92, radius: 2.5 },
  { orbit: 3, duration: 43, phase: 0.16, radius: 2 },
  { orbit: 3, duration: 46, phase: 0.01, radius: 2 },
  { orbit: 3, duration: 48, phase: 0.58, radius: 1.8 },
]

export function Technologies() {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const bubbles = useRef<(HTMLLIElement | null)[]>([])
  const connections = useRef<(SVGPathElement | null)[]>([])
  const rings = useRef<(SVGPathElement | null)[]>([])
  const dots = useRef<(SVGCircleElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    if (!section || !svg) return
    let frame = 0
    let elapsed = 0
    let previousTime = 0
    const lengths = rings.current.map(path => path?.getTotalLength() ?? 0)
    const draw = () => {
      const bounds = svg.getBoundingClientRect()
      const scale = bounds.width / 600
      if (!scale) return
      // Read every endpoint before writing, including CSS float and hover scale.
      const endpoints = bubbles.current.map(bubble => {
        const rect = bubble?.getBoundingClientRect()
        return rect ? { x: (rect.left + rect.width / 2 - bounds.left) / scale, y: (rect.bottom - bounds.top) / scale } : null
      })
      endpoints.forEach((point, index) => {
        if (point) connections.current[index]?.setAttribute('d', `M ${point.x} ${point.y} C ${point.x} 172, 300 174, 300 246`)
      })
      planets.forEach((planet, index) => {
        const path = rings.current[planet.orbit]
        const distance = ((planet.phase + elapsed / (planet.duration * 1000)) % 1) * lengths[planet.orbit]
        const point = path?.getPointAtLength(distance)
        if (!point) return
        dots.current[index]?.setAttribute('cx', String(point.x))
        dots.current[index]?.setAttribute('cy', String(point.y))
      })
    }
    const tick = (time: number) => {
      if (previousTime) elapsed += Math.min(time - previousTime, 100)
      previousTime = time
      draw()
      frame = requestAnimationFrame(tick)
    }
    const stop = observeMotion(section, active => {
      cancelAnimationFrame(frame)
      previousTime = 0
      draw()
      if (active) frame = requestAnimationFrame(tick)
    })
    const resize = new ResizeObserver(draw)
    resize.observe(svg)
    return () => { stop(); resize.disconnect(); cancelAnimationFrame(frame) }
  }, [])
  return (
    <section ref={sectionRef} className="technologies" aria-labelledby="objective-title">
      <h2 id="objective-title" className="objective">Criar soluções, aprender com desafios e evoluir como desenvolvedor é o que me move.</h2>
      <div className="technology-composition">
        <div className="technology-rows">
          {rows.map((row, index) => (
            <ul className="technology-row" aria-label={`Tecnologias — fileira ${index + 1}`} key={index}>
              {row.map(({ name, icon }, column) => (
                <li className="technology-bubble" key={name} ref={node => { if (index === 1) bubbles.current[column] = node }} style={{ '--float-duration': `${4 + ((column + index * 2) % 7) / 2}s`, '--float-delay': `${-(column * 0.73 + index * 1.4)}s` } as CSSProperties}>
                  <span className="technology-icon" role="img" aria-label={name} tabIndex={0} style={{ '--technology-icon': `url("${icon}")` } as CSSProperties} />
                  <span className="technology-tooltip" aria-hidden="true">{name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <svg ref={svgRef} className="technology-orbits" viewBox="0 0 600 360" fill="none" aria-hidden="true" focusable="false">
          <g className="technology-connections">
            {connectionStarts.map((x, index) => (
              <path ref={node => { connections.current[index] = node }} key={x} d={`M ${x} 106 C ${x} 172, 300 174, 300 246`} />
            ))}
          </g>
          <g className="orbital-rings">
            {orbitRadii.map(([rx, ry], index) => (
              <path key={rx} ref={node => { rings.current[index] = node }} d={`M ${300 + rx} 280 A ${rx} ${ry} 0 1 1 ${300 - rx} 280 A ${rx} ${ry} 0 1 1 ${300 + rx} 280 Z`} />
            ))}
          </g>
          <g className="orbital-dots">
            {planets.map((planet, index) => {
              const [rx, ry] = orbitRadii[planet.orbit]
              return <circle key={index} ref={node => { dots.current[index] = node }} cx={300 + rx * Math.cos(planet.phase * Math.PI * 2)} cy={280 + ry * Math.sin(planet.phase * Math.PI * 2)} r={planet.radius} />
            })}
          </g>
          <circle className="orbital-center" cx="300" cy="252" r="32" />
          <g className="orbital-code" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m288 243-10 9 10 9m24-18 10 9-10 9m-9-23-7 28" />
          </g>
        </svg>
      </div>
    </section>
  )
}
