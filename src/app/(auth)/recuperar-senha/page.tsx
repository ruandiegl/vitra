import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RequestResetForm, ResetPasswordForm } from "@/components/auth/password-forms";

export const metadata = { title: "Recuperar senha" };
export default async function RecoverPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <AuthShell title={token ? "Escolha uma nova senha." : "Recupere o acesso à sua conta."} description={token ? "O link pode ser usado uma única vez. Depois da alteração, as sessões antigas serão invalidadas." : "Informe seu e-mail. Se houver uma conta, enviaremos um link válido por uma hora."} footer={<Link href="/login" className="font-bold text-primary hover:underline">Voltar para o login</Link>}>{token ? <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-sky" />}><ResetPasswordForm /></Suspense> : <RequestResetForm />}</AuthShell>; }
