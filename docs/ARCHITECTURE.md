# Arquitetura da Vitra

## Decisões

A Vitra usa um **monólito modular** com Next.js App Router, TypeScript, PostgreSQL e Prisma. Server Components fazem leituras e Server Actions executam mutações autenticadas. APIs REST ficam reservadas a uploads, webhooks, tracking e integrações do navegador. Não há microsserviços, fila ou estado client-side como fonte de persistência.

### Módulos

- `src/lib/auth`: Auth.js, sessões JWT assinadas, papéis e contexto de workspace.
- `src/lib/sites`: slug, templates, versões, publicação e serialização segura.
- `src/lib/billing`: limites, estados de acesso e porta `PaymentProvider`.
- `src/lib/storage`: porta de armazenamento; driver local apenas em desenvolvimento e S3 para produção.
- `src/lib/analytics`: eventos públicos mínimos e agregações.
- `src/lib/admin`: operações administrativas e auditoria.
- `src/components`: UI compartilhada e componentes por domínio.

## Publicação

Cada site possui `draftVersionId` e, quando publicado, `publishedVersionId`. Uma versão contém configuração de perfil, tema próprio e blocos ordenados. Publicar copia o rascunho para uma nova versão imutável em uma transação. Despublicar e suspender não apagam versões. Templates são copiados na criação; não há vínculo vivo entre template e site.

## Segurança e isolamento

O workspace vem da sessão e da associação `Membership`; nunca de um ID enviado pelo navegador. Consultas de sites, assinaturas e métricas incluem `workspaceId`. `/admin` exige papel de plataforma no servidor. Suporte possui apenas ações explicitamente autorizadas. Operações administrativas gravam `AuditLog` sem segredos ou conteúdo confidencial desnecessário.

Senhas usam bcrypt com custo 12. Cookies de sessão são `httpOnly` e `sameSite=lax`; em produção, Auth.js usa cookies seguros. Tokens de verificação/recuperação são aleatórios, armazenados somente como SHA-256 e expiram. Uploads validam assinatura binária, MIME declarado, extensão e tamanho. HTML/JavaScript arbitrário não é aceito nos blocos.

## Assinaturas e acesso

A política inicial é trial de sete dias, sem cartão, configurada por `ACCESS_POLICY=TRIAL`. O administrador poderá evoluir as regras de comercialização; os três modos não são combinados. Publicação exige e-mail verificado e acesso vigente (`TRIAL` ou `ACTIVE`). Edição continua disponível durante atraso até o fim da tolerância; publicação nova é bloqueada em atraso. Cancelamento preserva dados e mantém acesso até o fim do período já pago.

O provedor `development` é isolado, identificado na interface e **não movimenta dinheiro**. O adapter real deve confirmar pagamentos por webhook autenticado; retorno do checkout nunca ativa assinatura.

## Infraestrutura

Desenvolvimento: Docker Compose para PostgreSQL, armazenamento local e e-mail no console. Produção prevista: Vercel, PostgreSQL gerenciado, object storage S3/R2, SMTP e gateway brasileiro. Segredos existem somente em variáveis de ambiente. Rate limiting distribuído, backups e alertas são requisitos de go-live documentados em `docs/DEPLOYMENT.md`.

## Decisões adiadas

Domínios personalizados, equipes, leads, pixels, afiliados e IA não entram no MVP. O modelo de memberships e a porta de pagamentos deixam pontos de extensão sem antecipar essa complexidade.
