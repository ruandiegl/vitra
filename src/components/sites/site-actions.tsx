"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { deleteSiteAction, duplicateSiteAction, unpublishSiteAction } from "@/lib/sites/actions";

export function DuplicateSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter(); const { toast } = useToast(); const [loading, setLoading] = useState(false);
  async function duplicate() { setLoading(true); const result = await duplicateSiteAction(siteId); toast({ title: result.success ? "Cópia criada" : "Não foi possível duplicar", description: result.message, tone: result.success ? "success" : "error" }); if (result.siteId) router.push(`/app/sites/${result.siteId}/editar`); else router.refresh(); setLoading(false); }
  return <Button variant="ghost" size="sm" onClick={duplicate} loading={loading}><Copy />Duplicar</Button>;
}

export function UnpublishSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter(); const { toast } = useToast(); const [loading, setLoading] = useState(false);
  async function unpublish() { setLoading(true); const result = await unpublishSiteAction(siteId); toast({ title: result.success ? "Site despublicado" : "Ação não realizada", description: result.message, tone: result.success ? "success" : "error" }); router.refresh(); setLoading(false); }
  return <Button variant="ghost" size="sm" onClick={unpublish} loading={loading}><Undo2 />Despublicar</Button>;
}

export function DeleteSiteDialog({ siteId, siteName }: { siteId: string; siteName: string }) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false);
  async function remove() { setLoading(true); const result = await deleteSiteAction(siteId); toast({ title: result.success ? "Minisite excluído" : "Exclusão não realizada", description: result.message, tone: result.success ? "success" : "error" }); if (result.success) { setOpen(false); router.refresh(); } setLoading(false); }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="sm" className="text-danger hover:bg-[#fee4e2] hover:text-danger"><Trash2 />Excluir</Button></DialogTrigger><DialogContent><DialogTitle>Excluir “{siteName}”?</DialogTitle><DialogDescription>O site sairá do ar e todas as versões e estatísticas dele serão excluídas. Esta ação não pode ser desfeita.</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)}>Manter minisite</Button><Button variant="danger" onClick={remove} loading={loading}>Excluir definitivamente</Button></div></DialogContent></Dialog>;
}
