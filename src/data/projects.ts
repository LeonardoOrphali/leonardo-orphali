import placeholder from '../assets/projects/preview-placeholder.svg'
import cineverseImage from '../assets/projects/cineverse.png'
import finlyImage from '../assets/projects/finly.png'

type Project = {
  id: string
  hidden?: boolean
  title: string
  category: string
  description: string
  technologies: string
  expandableTechnologies?: boolean
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
    description: 'O Finly reúne lançamentos, metas e planejamento financeiro em uma experiência simples. A proposta é facilitar a organização das finanças, permitindo acompanhar os registros e manter os objetivos financeiros em vista no dia a dia.',
    technologies: 'Next.js · TypeScript · Tailwind CSS · shadcn/ui · C# · ASP.NET Core (.NET 8) · Entity Framework Core · SQL Server · ASP.NET Core Identity · JWT · Resend · Swagger / OpenAPI · Docker · Docker Compose · Vitest · Flutter · Dart · Riverpod · GoRouter · Dio',
    expandableTechnologies: true,
    image: { src: finlyImage, alt: 'Visão geral do Finly com metas, saldo atual, transações recentes e gráfico de fluxo de caixa.', width: 1722, height: 938 },
    projectUrl: 'https://app.finly.systems',
    githubUrl: 'https://github.com/luizcarlxs01/Finly',
  },
  {
    id: 'orven',
    hidden: true, // Reativar quando o projeto estiver pronto.
    title: 'Orven',
    category: 'E-commerce de moda',
    description: 'O Orven é um e-commerce de moda que reúne catálogo de produtos, área administrativa e histórico de pedidos. O projeto conecta a apresentação das peças à organização da loja, com uma experiência voltada à navegação e à consulta de compras.',
    technologies: 'Next.js · ASP.NET Core · SQL Server',
    image: { src: placeholder, alt: 'Orven — prévia em breve', width: 1200, height: 750, placeholder: true },
    projectUrl: null,
    githubUrl: null,
  },
  {
    id: 'cineverse',
    title: 'CineVerse',
    category: 'Catálogo de filmes',
    description: 'O CineVerse é um catálogo integrado ao TMDB para explorar filmes e descobrir lançamentos. Com busca de títulos e uma seleção de favoritos, o projeto reúne descoberta e organização em uma experiência para encontrar o que assistir.',
    technologies: 'React · JavaScript · Tailwind CSS · Vite · Axios · REST API',
    image: { src: cineverseImage, alt: 'Página inicial do CineVerse com busca de filmes, favoritos e destaque para Batman: O Cavaleiro das Trevas.', width: 1894, height: 898 },
    projectUrl: 'https://cine-verse-system.vercel.app',
    githubUrl: 'https://github.com/LeonardoOrphali/cine-verse',
  },
]
