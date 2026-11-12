import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Criar conta" };
export default async function RegisterPage() { if (await getCurrentUser()) redirect("/app"); return <AuthShell title="Crie sua vitrine digital." description="Comece agora. Você só precisa escolher um modelo e deixar com a cara do seu negócio." footer={<>Já tem uma conta? <Link href="/login" className="font-bold text-primary hover:underline">Entrar</Link></>}><RegisterForm /></AuthShell>; }
