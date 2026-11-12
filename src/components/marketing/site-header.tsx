"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const links = [{ href: "/#funcionalidades", label: "Funcionalidades" }, { href: "/#como-funciona", label: "Como funciona" }, { href: "/exemplos", label: "Exemplos" }, { href: "/precos", label: "Planos" }, { href: "/faq", label: "Dúvidas" }];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm"><div className="shell flex h-[76px] items-center justify-between gap-5"><Logo /><nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">{links.map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-foreground">{link.label}</Link>)}</nav><div className="hidden items-center gap-2 sm:flex"><Button asChild variant="ghost"><Link href="/login">Entrar</Link></Button><Button asChild><Link href="/cadastro">Criar meu minisite</Link></Button></div><button type="button" className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-sky sm:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>{open ? <nav className="border-t border-border bg-white px-5 py-5 sm:hidden" aria-label="Navegação mobile"><div className="mx-auto flex max-w-lg flex-col">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-border font-semibold">{link.label}</Link>)}<div className="mt-5 grid grid-cols-2 gap-3"><Button asChild variant="secondary"><Link href="/login">Entrar</Link></Button><Button asChild><Link href="/cadastro">Criar conta</Link></Button></div></div></nav> : null}</header>;
}
