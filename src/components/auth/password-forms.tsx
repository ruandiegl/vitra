"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestPasswordResetAction, resetPasswordAction, verifyEmailAction, resendVerificationAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function RequestResetForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setMessage(""); setError(""); const data = new FormData(event.currentTarget); const result = await requestPasswordResetAction({ email: data.get("email") }); result.success ? setMessage(result.message) : setError(result.message); setLoading(false); }
  return <form onSubmit={submit} className="space-y-5"><div><Label htmlFor="email">E-mail da conta</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>{message ? <p role="status" className="rounded-xl bg-mint p-4 text-sm text-[#185b43]">{message}</p> : null}<FieldError>{error}</FieldError><Button className="w-full" size="lg" loading={loading}>Enviar instruções</Button></form>;
}

export function ResetPasswordForm() {
  const params = useSearchParams(); const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); const password = String(data.get("password")); if (password !== data.get("confirmation")) { setError("As senhas não são iguais."); setLoading(false); return; } const result = await resetPasswordAction({ token: params.get("token") ?? "", password }); if (!result.success) { setError(result.message); setLoading(false); return; } router.push("/login?reset=success"); }
  return <form onSubmit={submit} className="space-y-5"><div><Label htmlFor="password">Nova senha</Label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} /><span className="field-help">Use ao menos 8 caracteres, uma letra e um número.</span></div><div><Label htmlFor="confirmation">Repita a nova senha</Label><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required /></div><FieldError>{error}</FieldError><Button className="w-full" size="lg" loading={loading}>Salvar nova senha</Button></form>;
}

export function VerifyEmailButton({ token }: { token: string }) {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null); const [loading, setLoading] = useState(false);
  async function verify() { setLoading(true); setResult(await verifyEmailAction(token)); setLoading(false); }
  if (result) return <div role="status" className={result.success ? "rounded-xl bg-mint p-5 text-[#185b43]" : "rounded-xl bg-[#fee4e2] p-5 text-danger"}><p>{result.message}</p><Button asChild className="mt-4"><a href={result.success ? "/app" : "/recuperar-senha"}>{result.success ? "Ir para o painel" : "Voltar"}</a></Button></div>;
  return <Button size="lg" className="w-full" onClick={verify} loading={loading}>Confirmar meu e-mail</Button>;
}

export function ResendVerificationButton() {
  const { toast } = useToast(); const [loading, setLoading] = useState(false);
  async function resend() { setLoading(true); const result = await resendVerificationAction(); toast({ title: result.success ? "Verifique sua caixa de entrada" : "Envio não realizado", description: result.message, tone: result.success ? "success" : "error" }); setLoading(false); }
  return <Button variant="secondary" size="sm" onClick={resend} loading={loading}>Reenviar confirmação</Button>;
}
