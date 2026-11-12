# Modelo de dados

- **User / Workspace / Membership:** identidade global e isolamento por conta. Um usuário pode pertencer a mais de um workspace no futuro; o MVP seleciona o workspace do qual é proprietário.
- **Site / SiteVersion / SiteBlock / SiteTheme:** sites têm slug global único e status operacional. Versões possuem número único por site. Blocos são ordenados e visíveis por versão; o tema é uma linha própria por versão. JSON é restrito ao conteúdo polimórfico validado de cada bloco, não a relacionamentos de negócio.
- **Template / TemplatePlan:** estrutura reutilizável de modelos e disponibilidade por plano.
- **Plan / Subscription / Payment / PaymentEvent:** preço e limites dos planos; assinaturas guardam snapshots de valor/nome/ciclo. Eventos de webhook são deduplicados por identificador externo. Nenhum dado completo de cartão é persistido.
- **Coupon / CouponRedemption:** validade, limites e consumo auditável de descontos.
- **AnalyticsEvent:** visualizações e cliques com hash rotativo de visitante, sem IP bruto ou fingerprinting. Índices por site/data e site/bloco/data.
- **AuditLog:** ator, ação, entidade e data. Metadados são uma allowlist por ação.
- **LandingContent / AppSetting:** conteúdo institucional versionável por chave e configurações não secretas.
- **AuthToken / DataRequest:** verificação, recuperação, troca de e-mail e solicitações LGPD com estados explícitos.
- **Account / Session / VerificationToken:** compatibilidade com o adapter Auth.js e evolução para login social.

Consulte `prisma/schema.prisma` para tipos, índices e integridade referencial. Migrações versionadas ficam em `prisma/migrations`.
