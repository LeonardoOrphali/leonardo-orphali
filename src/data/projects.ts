import placeholder from '../assets/projects/preview-placeholder.svg'

type Project = {
  id: string
  title: string
  category: string
  description: string
  technologies: string
  image: { src: string; alt: string; width: number; height: number; placeholder?: boolean }
  projectUrl: string | null
  githubUrl: string | null
}

// Substitua as prévias e preencha as URLs quando os materiais reais estiverem disponíveis.
export const projects: Project[] = [
  {
    id: 'finly',
    title: 'Finly',
    category: 'Gestão financeira',
    description: 'Controle de lançamentos, metas e planejamento financeiro em uma experiência simples.',
    technologies: 'Next.js · C# · SQL Server',
    image: { src: placeholder, alt: 'Finly — prévia em breve', width: 1200, height: 750, placeholder: true },
    projectUrl: null,
    githubUrl: null,
  },
  {
    id: 'orven',
    title: 'Orven',
    category: 'E-commerce de moda',
    description: 'E-commerce de moda com catálogo, área administrativa e histórico de pedidos.',
    technologies: 'Next.js · ASP.NET Core · SQL Server',
    image: { src: placeholder, alt: 'Orven — prévia em breve', width: 1200, height: 750, placeholder: true },
    projectUrl: null,
    githubUrl: null,
  },
]
