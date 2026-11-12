"use client";

import { useState } from "react";
import { Check, Copy, Download, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { getSiteQrCodeAction } from "@/lib/sites/actions";

export function ShareSiteDialog({ siteId, url, trigger = "default" }: { siteId: string; url: string; trigger?: "default" | "icon" }) {
  const { toast } = useToast(); const [qrCode, setQrCode] = useState(""); const [copied, setCopied] = useState(false); const [loading, setLoading] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { toast({ title: "Não foi possível copiar", description: "Selecione o endereço e copie manualmente.", tone: "error" }); } }
  async function loadQrCode() { if (qrCode) return; setLoading(true); const result = await getSiteQrCodeAction(siteId); if (result.success && result.qrCode) setQrCode(result.qrCode); else toast({ title: "QR Code indisponível", description: result.message, tone: "error" }); setLoading(false); }
  return <Dialog onOpenChange={(open) => { if (open) void loadQrCode(); }}><DialogTrigger asChild>{trigger === "icon" ? <Button variant="ghost" size="icon" aria-label="Compartilhar minisite"><Share2 /></Button> : <Button variant="secondary"><Share2 />Compartilhar</Button>}</DialogTrigger><DialogContent><DialogTitle>Compartilhe seu minisite</DialogTitle><DialogDescription>Use o link na bio, nas mensagens ou apresente o QR Code no seu atendimento.</DialogDescription><div className="mt-6"><Label htmlFor={`url-${siteId}`}>Endereço público</Label><div className="flex gap-2"><Input id={`url-${siteId}`} readOnly value={url} onFocus={(event) => event.target.select()} /><Button variant="secondary" size="icon" onClick={copy} aria-label="Copiar endereço">{copied ? <Check /> : <Copy />}</Button></div></div><div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl bg-background p-5">{loading ? <div className="size-44 animate-pulse rounded-lg bg-sky" aria-label="Gerando QR Code" /> : qrCode ? <img src={qrCode} alt={`QR Code para ${url}`} className="size-44" /> : null}</div>{qrCode ? <Button asChild variant="secondary" className="mt-4 w-full"><a href={qrCode} download={`qrcode-${siteId}.png`}><Download />Baixar QR Code</a></Button> : null}</DialogContent></Dialog>;
}
