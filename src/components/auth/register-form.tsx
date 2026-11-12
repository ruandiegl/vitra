"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function RegisterForm() {
  const router = useRouter(); const { toast } = useToast();
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = event.currentTarget; const data = new FormData(form);
    const input = { name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")) };
    if (data.get("terms") !== "on") { setError("Aceite os Termos de uso e a Política de privacidade para continuar."); setLoading(false); return; }
    const result = await registerAction(input);
    if (!result.success) { setError(result.message); setLoading(false); return; }
    if (result.warning) toast({ title: "Conta criada com uma pendência", description: result.warning, tone: "error" });
    const login = await signIn("credentials", { email: input.email, password: input.password, redirect: false });
    if (login?.error) { router.push("/login"); return; }
    router.push("/app/onboarding"); router.refresh();
  }
  return <form onSubmit={submit} className="space-y-5" noValidate><div><Label htmlFor="name">Seu nome</Label><Input id="name" name="name" autoComplete="name" required maxLength={80} placeholder="Como podemos chamar você?" /></div><div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@seunegocio.com" /></div><div><Label htmlFor="password">Crie uma senha</Label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} /><span className="field-help">Mínimo de 8 caracteres, com pelo menos uma letra e um número.</span></div><label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-muted"><Input type="checkbox" name="terms" className="mt-0.5 size-5 min-h-5 w-5 accent-[#3155d9]" required /><span>Li e aceito os <Link href="/termos" target="_blank" className="font-semibold text-primary hover:underline">Termos de uso</Link> e a <Link href="/privacidade" target="_blank" className="font-semibold text-primary hover:underline">Política de privacidade</Link>.</span></label><FieldError>{error}</FieldError><Button type="submit" size="lg" className="w-full" loading={loading}>Criar minha conta</Button><p className="text-center text-xs text-muted">O teste de 7 dias não pede cartão. A publicação exige confirmação de e-mail.</p></form>;
}
