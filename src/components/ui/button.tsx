import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark",
        secondary: "border border-border bg-white text-foreground hover:border-primary hover:text-primary",
        ghost: "text-foreground hover:bg-sky",
        danger: "bg-danger text-white hover:bg-[#922018]",
        mint: "bg-mint text-foreground hover:bg-[#c4e6d6]",
      },
      size: {
        default: "min-h-11 px-4",
        sm: "min-h-10 rounded-lg px-3 text-sm",
        lg: "min-h-13 rounded-[14px] px-6 text-base",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({ className, variant, size, asChild = false, loading, children, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
      {asChild ? <Slottable>{children}</Slottable> : children}
    </Comp>
  );
}

export { buttonVariants };
