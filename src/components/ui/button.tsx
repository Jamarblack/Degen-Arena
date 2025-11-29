import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-bronze border-2 border-primary/40 rounded-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-stone border-2 border-destructive/40 rounded-sm",
        outline: "border-2 border-border bg-card/50 hover:bg-accent hover:text-accent-foreground shadow-stone rounded-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-stone border-2 border-secondary/40 rounded-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        wallet: "bg-gradient-to-br from-primary via-primary to-primary/80 border-3 border-primary/60 text-primary-foreground font-header font-bold uppercase tracking-widest hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 shadow-bronze rounded-sm",
        long: "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 font-header font-bold text-lg uppercase tracking-widest shadow-bronze border-3 border-primary/60 rounded-sm",
        short: "bg-gradient-to-br from-destructive via-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:via-destructive/90 hover:to-destructive/70 font-header font-bold text-lg uppercase tracking-widest shadow-stone border-3 border-destructive/60 rounded-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
