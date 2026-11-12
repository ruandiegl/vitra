import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Entrar" };
export default async function LoginPage() { if (await getCurrentUser()) redirect("/app"); return <AuthShell title="Que bom ter você de volta." description="Entre para editar seus minisites e acompanhar seus resultados." footer={<>Ainda não tem uma conta? <Link href="/cadastro" className="font-bold text-primary hover:underline">Criar minha conta</Link></>}><Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-sky" />}><LoginForm /></Suspense></AuthShell>; }
