import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("field-label", className)} {...props} />;
}
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("field", className)} {...props} />;
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("field min-h-28 resize-y", className)} {...props} />;
}
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("field appearance-none bg-[linear-gradient(45deg,transparent_50%,#5d667d_50%),linear-gradient(135deg,#5d667d_50%,transparent_50%)] bg-[position:calc(100%-18px)_20px,calc(100%-13px)_20px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10", className)} {...props}>{children}</select>;
}
export function FieldError({ children }: { children?: React.ReactNode }) {
  return children ? <p role="alert" className="field-error">{children}</p> : null;
}
