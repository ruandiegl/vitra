import type { BlockType } from "@prisma/client";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "website";

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
};

export type BlockContent = {
  HEADER: {
    showName: boolean;
    showDescription: boolean;
    alignment: "left" | "center";
  };
  BUTTON: {
    label: string;
    url: string;
    icon: string;
    newTab: boolean;
  };
  SOCIAL_LINKS: {
    links: SocialLink[];
  };
  BANNER: {
    imageUrl: string;
    alt: string;
    title: string;
    description: string;
    url: string;
  };
  TEXT: {
    title: string;
    body: string;
  };
  DIVIDER: Record<string, never>;
  GOOGLE_REVIEW: {
    label: string;
    url: string;
  };
  CONTACT: {
    phone: string;
    email: string;
    address: string;
    mapsUrl: string;
    whatsappNumber: string;
    whatsappMessage: string;
    whatsappLabel: string;
  };
};

export type SiteBlockData<T extends BlockType = BlockType> = {
  id?: string;
  key: string;
  type: T;
  position: number;
  isVisible: boolean;
  content: T extends keyof BlockContent ? BlockContent[T] : never;
};

export type SiteConfig = {
  businessName: string;
  title: string;
  description: string;
  category: string;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  socialImageUrl: string;
};

export type SiteThemeData = {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  backgroundImage: string;
  font: string;
  cornerRadius: number;
  spacing: number;
  buttonStyle: "solid" | "outline" | "soft";
  logoShape: "circle" | "square";
  showPlatformMark: boolean;
};

export type SiteSnapshot = {
  config: SiteConfig;
  theme: SiteThemeData;
  blocks: SiteBlockData[];
};

export const defaultConfig: SiteConfig = {
  businessName: "Meu negócio",
  title: "Meu negócio",
  description: "Conheça meu trabalho e fale comigo.",
  category: "Serviços",
  logoUrl: "",
  seoTitle: "",
  seoDescription: "",
  socialImageUrl: "",
};

export const defaultTheme: SiteThemeData = {
  primaryColor: "#3155D9",
  secondaryColor: "#E3EBFF",
  textColor: "#17213A",
  buttonColor: "#3155D9",
  buttonTextColor: "#FFFFFF",
  backgroundColor: "#F6F8FC",
  backgroundImage: "",
  font: "DM Sans",
  cornerRadius: 16,
  spacing: 16,
  buttonStyle: "solid",
  logoShape: "circle",
  showPlatformMark: true,
};

export function emptyBlockContent(type: BlockType): SiteBlockData["content"] {
  const content: BlockContent = {
    HEADER: { showName: true, showDescription: true, alignment: "center" },
    BUTTON: { label: "Novo botão", url: "https://", icon: "link", newTab: true },
    SOCIAL_LINKS: { links: [] },
    BANNER: { imageUrl: "", alt: "", title: "", description: "", url: "" },
    TEXT: { title: "Novo texto", body: "Escreva aqui as informações para seus visitantes." },
    DIVIDER: {},
    GOOGLE_REVIEW: { label: "Avalie no Google", url: "https://" },
    CONTACT: {
      phone: "",
      email: "",
      address: "",
      mapsUrl: "",
      whatsappNumber: "",
      whatsappMessage: "Olá! Vim pelo minisite.",
      whatsappLabel: "Conversar no WhatsApp",
    },
  };
  return content[type];
}
