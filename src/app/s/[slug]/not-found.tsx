import Link from "next/link";
import { Logo } from "@/components/brand/logo";
export default function PublicSiteNotFound() { return <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center"><Logo /><h1 className="mt-8 font-display text-4xl font-semibold">Este minisite não está disponível.</h1><p className="mt-3 max-w-md text-muted">O endereço pode estar incorreto, despublicado ou temporariamente suspenso.</p><Link href="/" className="mt-6 font-bold text-primary hover:underline">Conhecer a Vitra</Link></main>; }
