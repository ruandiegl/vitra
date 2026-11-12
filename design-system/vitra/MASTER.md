# Vitra — design system

## Direção

**Vitrine digital para pequenos negócios.** A interface deve parecer capaz sem parecer técnica. O elemento memorável é a composição de vitrines: páginas públicas e prévias aparecem em molduras de dispositivo reais, não em ilustrações genéricas. O restante é quieto e funcional.

A sugestão automática de liquid glass, preto/dourado e Cormorant/Montserrat foi descartada: comunica moda de luxo e adiciona custo visual, enquanto o produto pede clareza, proximidade e edição eficiente.

## Cor

| Token | Hex | Uso |
|---|---|---|
| Porcelain | `#F6F8FC` | Fundo principal |
| Surface | `#FFFFFF` | Formulários e superfícies |
| Ink | `#17213A` | Texto e navegação escura |
| Cobalt | `#3155D9` | Ação principal e foco |
| Cobalt dark | `#2443B4` | Hover da ação |
| Sky | `#E3EBFF` | Seleção e áreas de apoio |
| Mint | `#D8F0E5` | Sucesso e destaque secundário |
| Muted | `#5D667D` | Texto secundário (contraste AA sobre Porcelain) |
| Border | `#DDE2EC` | Divisões |
| Danger | `#B42318` | Erros e ações destrutivas |

Não usar gradientes como decoração genérica. Cobalto é reservado a ações e estados ativos. Não depender apenas de cor para status.

## Tipografia

- Display: **Bricolage Grotesque**, pesos 500–700; títulos compactos, sem palavras isoladas em itálico/cor.
- Texto e UI: **DM Sans**, 16px base, pesos 400–700, line-height 1.5.
- Escala: 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64px. Mobile reduz display para 42px.
- Texto alinhado à esquerda; centralização apenas em pequenas chamadas ou estados vazios. Linhas de leitura até 68 caracteres.

## Layout

- Container comercial: máximo 1200px, gutters 20/32px.
- Hero assimétrico: copy à esquerda e demonstração renderizada à direita.
- Dashboard: sidebar de 248px no desktop; navegação em drawer no mobile.
- Editor desktop: categorias | campos | prévia. Mobile: abas Editar/Visualizar.
- Bordas de 12px em controles e 20px em superfícies; molduras de telefone têm raio próprio de 36px. Evitar transformar todo texto em um card.

## Componentes

- Alvos interativos mínimos de 44×44px; foco com anel cobalto de 3px e offset de 2px.
- Botão primário cobalto com texto branco; secundário branco com borda; ação destrutiva exige confirmação.
- Inputs com label visível, ajuda/erro junto ao campo e validação no servidor.
- Tabelas viram listas ou ganham rolagem explícita no mobile; nunca causam scroll horizontal na página.
- Status combina ícone/texto/cor. Skeletons reservam espaço; estados vazios explicam a próxima ação.
- Ícones Lucide consistentes, com nome acessível quando o botão não tem texto. Sem emojis como ícones.

## Movimento

Somente feedback de interação e uma entrada orquestrada no hero, 180–300ms. Sem reveal em cada seção, parallax ou animação contínua. `prefers-reduced-motion` desativa entradas e smooth scrolling.

## Checklist

- Contraste AA, teclado, foco visível e labels verificados.
- 375, 768, 1024 e 1440px sem overflow.
- Nenhum dado fictício apresentado como métrica real.
- Prévia é o mesmo renderer do minisite público.
- Nenhuma funcionalidade indisponível finge estar concluída.
