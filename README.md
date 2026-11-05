# Leonardo Orphali

### Desenvolvedor Fullstack · São Paulo, Brasil

Sou graduando em Ciência da Computação e desenvolvo aplicações web com **React, Next.js e C#/.NET**. Busco oportunidades para contribuir com projetos, aprender e evoluir como desenvolvedor.

[**Acesse meu portfólio**](https://leonardoorphali.github.io/leonardo-orphali/)

---

### Vamos conversar?

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge)](https://www.linkedin.com/in/leonardo-orphali)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:leonardoorphali2@gmail.com)

**E-mail:** [leonardoorphali2@gmail.com](mailto:leonardoorphali2@gmail.com)

## Executar o projeto

Use Node.js 22.18+ ou 24+ e npm:

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test
```

`npm test` usa o runner nativo do Node, com HTTP simulado. Não envia mensagens reais.
O build estático é gerado em `dist/`. O `base` do GitHub Pages continua sendo
`/leonardo-orphali/`.

## Habilitar o formulário com Formspree

1. Crie uma conta em [Formspree](https://formspree.io/) e confirme seu endereço de e-mail.
   Crie um formulário pelo painel (**New Form**). Configure **Target Email** nas
   configurações desse formulário como **leonardoorphali2@gmail.com** e confirme o
   endereço pelo e-mail de verificação enviado pelo Formspree. O destinatário é
   configurado no serviço; nenhum campo do site permite que visitantes o alterem.
2. Abra a seção **Integration** do formulário e copie o endpoint completo exibido
   em **Your form's endpoint is**. O formato é `https://formspree.io/f/SEU_FORM_ID`;
   substitua o placeholder pelo ID real fornecido pelo painel.
3. Para testar localmente, copie `.env.example` para `.env.local` e preencha:

   ```dotenv
   VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/SEU_FORM_ID
   ```

   Reinicie `npm run dev` após editar a variável. Sem um endpoint válido o formulário
   permanece desabilitado e informa a indisponibilidade. O placeholder do exemplo
   não habilita o envio. `.env` e suas variantes locais estão no `.gitignore`.
4. No repositório GitHub, acesse **Settings → Secrets and variables → Actions → Variables**.
   Clique em **New repository variable**. Use o nome `VITE_FORMSPREE_ENDPOINT` e cole
   o endpoint real completo no valor. O workflow passa `${{ vars.VITE_FORMSPREE_ENDPOINT }}`
   ao passo **Gerar build**.
5. Execute um novo deploy: em **Actions**, selecione **Publicar portfólio**, clique
   em **Run workflow**, escolha `main` e confirme. Um push posterior em `main` também
   executa esse workflow. O Vite incorpora o valor durante o build: apenas alterar a
   variável no GitHub não atualiza um site já publicado.
6. O endpoint é público e ficará visível no JavaScript do frontend. Não é uma chave
   privada. Não coloque tokens, senhas nem chaves privadas em variáveis `VITE_*`.

A implementação usa `fetch`, POST JSON e `Accept: application/json`, sem recarregar
nem redirecionar a página. Envia somente `name`, `email`, `message` e `_gotcha`.
O campo `email` é o mecanismo documentado de **Reply-To** do Formspree. Nenhum
campo `to`, `_cc` ou destinatário é aceito a partir dos dados do visitante.

Os campos são obrigatórios e rejeitam espaços em branco. Os limites documentados
em `src/services/contact.ts` são: nome de até 120 caracteres, e-mail de até 254 e
mensagem de até 5.000. O timeout é de 15 segundos; o código cancela a requisição ao
expirar ou ao desmontar o componente. Não há repetição automática de envios.
Timeout ou erro de rede não confirmam entrega, e os campos são preservados.
A interface limpa os valores somente após resposta de sucesso do serviço e bloqueia
envios simultâneos tanto no componente quanto no serviço.

O campo oculto `_gotcha` implementa o honeypot oficial e complementa os filtros de
spam do Formspree. Se ele for preenchido, a aplicação rejeita a tentativa, sem
simular sucesso. Não foi adicionado CAPTCHA fictício. As proteções configuradas no
painel devem ser compatíveis com o envio AJAX; qualquer desafio que exija um token
precisa de uma integração real correspondente, e uma rejeição do serviço é exibida
como erro. Também é possível configurar no Formspree a restrição ao domínio do site.

O serviço traduz para português erros de validação, limite de requisições, rede,
timeout, cancelamento e indisponibilidade. Os testes em `tests/contact.test.mjs`
cobrem esses cenários, o payload de sucesso e a prevenção de envios duplicados, com
requisições inteiramente simuladas.

Referências oficiais consultadas:

- [Criar formulário e obter endpoint](https://help.formspree.io/articles/building-your-form/building-an-html-form/)
- [Envio com JavaScript e resposta JSON](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax)
- [Endereço de resposta (Reply-To)](https://help.formspree.io/articles/building-your-form/email-reply-to-address/)
- [Honeypot contra spam](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/)
