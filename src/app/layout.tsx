import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Vitra — seu negócio em uma página profissional", template: "%s | Vitra" },
  description: "Crie e publique um minisite com seus links, serviços, redes sociais e identidade visual.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6F8FC" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${dmSans.variable} ${bricolage.variable}`}><body><a href="#conteudo" className="fixed left-4 top-3 z-[200] -translate-y-20 rounded-lg bg-foreground px-4 py-2 text-white focus:translate-y-0">Pular para o conteúdo</a><ToastProvider>{children}</ToastProvider></body></html>;
}
