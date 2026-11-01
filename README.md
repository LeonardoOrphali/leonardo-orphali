# Portfólio — Leonardo Orphali

Landing page pessoal com React, TypeScript, Vite, Tailwind CSS e Lucide React.
Contém o Header, a apresentação, objetivo e tecnologias, projetos selecionados, contato e rodapé, seguindo as referências fornecidas.

## Executar localmente

Requer Node.js 22.12+ (ou 24+) e npm.

```sh
npm install
npm run dev
```

## Verificações e build

```sh
npm run lint
npm run build
npm run preview
```

O build é gerado em `dist/`. O preview serve o build localmente; não faz deploy.

## Organização

- `src/components/Header.tsx`: marca, navegação e espaço para o controle de tema.
- `src/App.tsx`: apresentação, cursor SVG decorativo e alternância de tema.
- `src/index.css`: Tailwind, fontes locais, variáveis dos temas e responsividade.
- `src/components/Technologies.tsx`: objetivo, dados das 14 tecnologias e composição orbital SVG.
- `src/components/Technologies.css`: disposição proporcional dos ícones, linhas e órbitas.
- `src/components/Projects.tsx` e `Projects.css`: projetos alternados no desktop e empilhados no mobile.
- `src/data/projects.ts`: textos, imagens, dimensões e URLs dos projetos.
- `src/components/Contact.tsx` e `Contact.css`: formulário, validação acessível e contatos alternativos.
- `src/services/contact.ts`: validação e função isolada para conectar o envio real.
- `src/data/contact.ts`: URLs de contato, ainda pendentes.
- `src/components/Footer.tsx` e `Footer.css`: nome e localização.
- `src/assets/technologies/`: ícones locais Devicon v2.17.0, com licença MIT incluída em `LICENSE.txt`. As máscaras CSS deixam os ícones monocromáticos nos dois temas.
- `index.html`: idioma, SEO e script de inicialização do tema antes da renderização.

A primeira visita respeita o tema do sistema. A escolha manual é salva na chave
`theme` do localStorage, quando disponível. Sem acesso ao armazenamento, o controle
continua funcionando na sessão atual. A fonte Inter é distribuída pelo build via
`@fontsource/inter`, sem requisições para provedores externos de fontes.

“Projetos” navega para `#projetos`; “Contato” e “Vamos conversar” navegam para `#contato`.
Não há backend, roteamento, formulário ou deploy configurado.

## Materiais pendentes dos projetos

Finly e Orven ainda precisam das capturas reais, da URL pública e da URL do GitHub.
Até lá, ambos usam o SVG neutro `src/assets/projects/preview-placeholder.svg`, com
“Prévia em breve”, e ações desabilitadas. Para substituir, importe a captura em
`src/data/projects.ts`, atualize `image` (incluindo alt, width e height), remova
`placeholder: true` e preencha `projectUrl` e `githubUrl` com URLs reais.

## Habilitar contato

O envio ainda não está integrado. A interface informa a indisponibilidade e mantém
o botão desabilitado. Os campos validam vazios, espaços e formato do e-mail ao perder
foco; o envio também tem validação, estados de envio/sucesso/erro, proteção contra
duplicações e preservação dos valores em caso de erro.

Conecte `contactService.send` em `src/services/contact.ts` a uma integração real e
habilite `available` somente quando ela estiver pronta. A função deve resolver apenas
após a confirmação do envio e rejeitar em caso de falha. Não coloque chaves privadas
no frontend. Nenhum backend ou serviço externo foi adicionado nesta etapa.

Preencha `src/data/contact.ts` com o endereço de e-mail real (`mailto:`), o LinkedIn
e o GitHub. Até isso acontecer, os três itens permanecem desabilitados.

## Animações

- `HeroCursor.tsx`: flutuação CSS de 8px/5s e parallax com springs do Motion para React, sem estado React por movimento. No touch, somente flutuação.
- `Technologies.tsx`: flutuação CSS com fases variadas; refs alinham as sete conexões inferiores à posição visual das bolinhas. Os planetas usam `getPointAtLength` nos próprios paths SVG das elipses, com ciclos de 25 a 50 segundos.
- `observeMotion.ts`: pausa os movimentos contínuos fora da viewport, com aba oculta e com `prefers-reduced-motion` ativo; responde a mudanças dessas condições.
- `useSectionEntrance.ts`: introdução escalonada no topo, digitação única de 1,2s e revelação por blocos em 550ms; sem animações de entrada duplicadas em pais e filhos.

As animações preservam a paleta dos temas, não interferem no cursor do navegador e limpam observers, listeners e loops ao desmontar.

A introdução é ignorada em acesso por âncora, scroll restaurado e movimento reduzido. O título mantém todos os caracteres no layout desde o início, com uma versão completa acessível e uma camada visual ignorada por leitores de tela. Foco em conteúdo oculto o revela imediatamente. As animações são canceladas e os observers/listeners removidos na desmontagem, inclusive em StrictMode. Tecnologias e órbitas compartilham uma única entrada para manter linhas e ícones alinhados.

A introdução e as revelações agora usam `animate` do Motion já instalado. A digitação usa timers com limpeza em StrictMode e visibilidade dos caracteres, reservando o título completo no layout. `#sobre` permite a introdução; âncoras para outras seções e scroll já restaurado a ignoram. Falhas no IntersectionObserver não cancelam a introdução. A inicialização revela o conteúdo imediatamente no modo de movimento reduzido.
