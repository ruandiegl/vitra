import type { BlockType } from "@prisma/client";
import { defaultConfig, defaultTheme, type SiteBlockData, type SiteConfig, type SiteSnapshot, type SiteThemeData } from "./types";

type TemplateInput = {
  name: string;
  slug: string;
  category: string;
  description: string;
  config: Partial<SiteConfig>;
  theme?: Partial<SiteThemeData>;
  whatsapp?: string;
  instagram?: string;
  extraBlocks?: SiteBlockData[];
};

function block(type: BlockType, key: string, position: number, content: SiteBlockData["content"]): SiteBlockData {
  return { key, type, position, isVisible: true, content } as SiteBlockData;
}

function makeTemplate(input: TemplateInput): SiteSnapshot & Omit<TemplateInput, "config" | "theme" | "extraBlocks" | "whatsapp" | "instagram"> {
  const name = input.config.businessName ?? "Meu negócio";
  const blocks: SiteBlockData[] = [
    block("HEADER", `${input.slug}-header`, 0, { showName: true, showDescription: true, alignment: "center" }),
    ...(input.extraBlocks ?? []),
    block("BUTTON", `${input.slug}-whatsapp`, 20, {
      label: "Pedir pelo WhatsApp", url: input.whatsapp ?? "https://wa.me/5511999999999", icon: "message", newTab: true,
    }),
    block("SOCIAL_LINKS", `${input.slug}-social`, 30, {
      links: [
        { id: `${input.slug}-instagram`, platform: "instagram", url: input.instagram ?? "https://instagram.com/" },
        { id: `${input.slug}-website`, platform: "website", url: "https://example.com/" },
      ],
    }),
    block("GOOGLE_REVIEW", `${input.slug}-reviews`, 40, { label: "Ver avaliações no Google", url: "https://www.google.com/search" }),
  ];
  return {
    name: input.name,
    slug: input.slug,
    category: input.category,
    description: input.description,
    config: { ...defaultConfig, businessName: name, title: name, ...input.config },
    theme: { ...defaultTheme, ...input.theme },
    blocks: blocks.map((item, index) => ({ ...item, position: index })),
  };
}

export const starterTemplates = [
  makeTemplate({
    name: "Mesa & Brasa",
    slug: "restaurante-mesa-e-brasa",
    category: "Restaurante",
    description: "Cardápio, pedidos e reservas em uma apresentação acolhedora.",
    config: { businessName: "Mesa & Brasa", description: "Cozinha de brasa, ingredientes locais e uma mesa sempre pronta para você.", category: "Restaurante" },
    theme: { primaryColor: "#9A3412", buttonColor: "#9A3412", secondaryColor: "#FFEDD5", backgroundColor: "#FFF9F2", textColor: "#3B241B" },
    extraBlocks: [block("BANNER", "restaurante-banner", 10, { imageUrl: "", alt: "", title: "Menu da semana", description: "Pratos do dia, sobremesas e bebidas.", url: "https://example.com/menu" })],
  }),
  makeTemplate({
    name: "Navalha Studio",
    slug: "barbearia-navalha",
    category: "Barbearia",
    description: "Agendamentos e serviços com identidade escura e precisa.",
    config: { businessName: "Navalha Studio", description: "Cortes autorais, barba e cuidado sem pressa. Escolha seu horário.", category: "Barbearia" },
    theme: { primaryColor: "#D5A84B", buttonColor: "#D5A84B", buttonTextColor: "#1D1D1B", secondaryColor: "#343431", backgroundColor: "#1D1D1B", textColor: "#F7F3EA" },
    extraBlocks: [block("TEXT", "barbearia-services", 10, { title: "Serviços", body: "Corte · Barba · Sobrancelha\nTerça a sábado, das 9h às 20h" })],
  }),
  makeTemplate({
    name: "Clara Nutrição",
    slug: "profissional-clara-nutricao",
    category: "Profissional liberal",
    description: "Apresentação profissional, contato e agendamento de consultas.",
    config: { businessName: "Clara Nutrição", description: "Nutrição possível para a sua rotina. Atendimento online e presencial.", category: "Profissional liberal" },
    theme: { primaryColor: "#28785F", buttonColor: "#28785F", secondaryColor: "#D8F0E5", backgroundColor: "#F5FAF7", textColor: "#193B31" },
    extraBlocks: [block("TEXT", "clara-about", 10, { title: "Como funciona", body: "Na primeira consulta, conversamos sobre sua rotina, seus objetivos e construímos um plano que cabe na vida real." })],
  }),
  makeTemplate({
    name: "Casa Aroeira",
    slug: "loja-casa-aroeira",
    category: "Loja",
    description: "Vitrine de novidades, catálogo e atendimento para lojas.",
    config: { businessName: "Casa Aroeira", description: "Objetos, cerâmicas e presentes feitos por pequenos criadores brasileiros.", category: "Loja" },
    theme: { primaryColor: "#8C4C64", buttonColor: "#8C4C64", secondaryColor: "#F5E5EB", backgroundColor: "#FCF8FA", textColor: "#412433" },
    extraBlocks: [block("BANNER", "loja-collection", 10, { imageUrl: "", alt: "", title: "Coleção nova", description: "Peças em pequenos lotes, direto do ateliê.", url: "https://example.com/catalogo" })],
  }),
  makeTemplate({
    name: "Rafa em Pauta",
    slug: "criador-rafa-em-pauta",
    category: "Criador de conteúdo",
    description: "Vídeos, parcerias e comunidade reunidos em um só link.",
    config: { businessName: "Rafa em Pauta", description: "Tecnologia sem jargão. Vídeos novos toda semana.", category: "Criador de conteúdo" },
    theme: { primaryColor: "#6D4AD0", buttonColor: "#6D4AD0", secondaryColor: "#ECE5FF", backgroundColor: "#F8F6FF", textColor: "#29203F" },
    extraBlocks: [block("BUTTON", "criador-video", 10, { label: "Assistir ao último vídeo", url: "https://youtube.com/", icon: "play", newTab: true })],
  }),
  makeTemplate({
    name: "Página em branco",
    slug: "pagina-em-branco",
    category: "Essencial",
    description: "Comece com cabeçalho, um botão e liberdade para personalizar.",
    config: { businessName: "Meu negócio", description: "Conheça meu trabalho e fale comigo.", category: "Outro" },
    extraBlocks: [],
  }),
];

export function getStarterTemplate(slug: string) {
  return starterTemplates.find((template) => template.slug === slug);
}
