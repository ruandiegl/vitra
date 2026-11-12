import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailButton } from "@/components/auth/password-forms";

export const metadata = { title: "Confirmar e-mail" };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <AuthShell title="Confirme seu e-mail." description="Esta confirmação protege sua conta e é necessária para publicar seu minisite." footer={<Link href="/app" className="font-bold text-primary hover:underline">Voltar para o painel</Link>}>{token ? <VerifyEmailButton token={token} /> : <p role="alert" className="rounded-xl bg-[#fee4e2] p-4 text-danger">O link está incompleto. Solicite uma nova confirmação no painel.</p>}</AuthShell>; }
