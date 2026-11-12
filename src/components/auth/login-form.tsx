"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/form";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    if (result?.error) { setError("E-mail ou senha não conferem. Tente novamente."); setLoading(false); return; }
    const requested = searchParams.get("callbackUrl");
    const destination = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/app";
    router.push(destination); router.refresh();
  }
  return <form onSubmit={submit} className="space-y-5" noValidate><div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@seunegocio.com" /></div><div><div className="flex items-center justify-between"><Label htmlFor="password">Senha</Label><Link href="/recuperar-senha" className="mb-2 text-sm font-semibold text-primary hover:underline">Esqueci a senha</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" required /></div><FieldError>{error}</FieldError><Button type="submit" size="lg" className="w-full" loading={loading}>Entrar</Button></form>;
}
