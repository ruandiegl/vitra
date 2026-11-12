"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Crop, LoaderCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function ImageUpload({ value, onChange, label, aspect = "square", siteId }: { value: string; onChange: (url: string) => void; label: string; aspect?: "square" | "wide"; siteId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null); const [source, setSource] = useState(""); const [open, setOpen] = useState(false); const [zoom, setZoom] = useState(1); const [offsetX, setOffsetX] = useState(0); const [offsetY, setOffsetY] = useState(0); const [uploading, setUploading] = useState(false); const { toast } = useToast();
  function choose(file?: File) { if (!file) return; if (file.size > 5 * 1024 * 1024) { toast({ title: "Imagem muito grande", description: "Escolha um arquivo de até 5 MB.", tone: "error" }); return; } const reader = new FileReader(); reader.onload = () => { setSource(String(reader.result)); setZoom(1); setOffsetX(0); setOffsetY(0); setOpen(true); }; reader.readAsDataURL(file); }
  async function cropAndUpload() {
    if (!source) return; setUploading(true);
    const image = new window.Image(); image.src = source; await image.decode();
    const canvas = document.createElement("canvas"); const width = aspect === "square" ? 800 : 1600; const height = aspect === "square" ? 800 : 900; canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d"); if (!context) { setUploading(false); return; }
    const scale = Math.max(width / image.width, height / image.height) * zoom; const drawWidth = image.width * scale; const drawHeight = image.height * scale; const x = (width - drawWidth) / 2 + (offsetX / 100) * width / 2; const y = (height - drawHeight) / 2 + (offsetY / 100) * height / 2; context.drawImage(image, x, y, drawWidth, drawHeight);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .88)); if (!blob) { setUploading(false); return; }
    const form = new FormData(); form.append("file", new File([blob], "imagem.webp", { type: "image/webp" }));
    const response = await fetch("/api/upload", { method: "POST", body: form }); const result = await response.json() as { url?: string; error?: string }; setUploading(false);
    if (!response.ok || !result.url) { toast({ title: "Upload não realizado", description: result.error ?? "Tente novamente.", tone: "error" }); return; }
    onChange(result.url); setOpen(false); setSource(""); toast({ title: "Imagem enviada", tone: "success" });
  }
  return <div><Label>{label}</Label>{value ? <div className="relative mb-3 inline-block"><Image src={value} alt="Imagem atual" width={aspect === "square" ? 96 : 260} height={aspect === "square" ? 96 : 146} unoptimized className={`border border-border object-cover ${aspect === "square" ? "size-24 rounded-2xl" : "h-28 w-56 rounded-xl"}`} /><button type="button" onClick={() => onChange("")} className="absolute -right-2 -top-2 inline-flex size-7 items-center justify-center rounded-full bg-danger text-white" aria-label="Remover imagem"><Trash2 className="size-3.5" /></button></div> : null}<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ""; }} /><Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}><Upload />{value ? "Trocar imagem" : "Enviar imagem"}</Button><span className="field-help">PNG, JPEG ou WebP · até 5 MB</span><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>Enquadrar imagem</DialogTitle><DialogDescription>Ajuste o zoom e a posição antes de enviar. A imagem será convertida para WebP.</DialogDescription><div className="mt-5 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-background">{source ? <img src={source} alt="Prévia para recorte" className="max-h-full max-w-full object-contain" style={{ transform: `scale(${zoom}) translate(${offsetX / 2}%, ${offsetY / 2}%)` }} /> : null}</div><div className="mt-5 space-y-4"><div><Label htmlFor="zoom">Zoom</Label><Input id="zoom" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="offset-x">Posição horizontal</Label><Input id="offset-x" type="range" min="-100" max="100" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} /></div><div><Label htmlFor="offset-y">Posição vertical</Label><Input id="offset-y" type="range" min="-100" max="100" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} /></div></div></div><Button className="mt-6 w-full" onClick={cropAndUpload} loading={uploading}><Crop />Recortar e enviar</Button></DialogContent></Dialog></div>;
}
