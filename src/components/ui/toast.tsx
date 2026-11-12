"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type Toast = { id: number; title: string; description?: string; tone: "success" | "error" };
type ToastContextValue = { toast: (input: Omit<Toast, "id">) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const toast = useCallback((input: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { ...input, id }]);
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-32px)] max-w-sm flex-col gap-2" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-xl">
            {item.tone === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#23795b]" aria-hidden="true" /> : <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />}
            <div className="min-w-0 flex-1"><p className="font-bold">{item.title}</p>{item.description ? <p className="mt-0.5 text-sm text-muted">{item.description}</p> : null}</div>
            <button type="button" onClick={() => dismiss(item.id)} className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-background" aria-label="Fechar aviso"><X className="size-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return context;
}
