import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-dream-purple-500 to-dream-purple-600 text-white hover:from-dream-purple-600 hover:to-dream-purple-700 shadow-lg hover:shadow-xl hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-dream-purple-300 bg-transparent hover:bg-dream-purple-50 text-dream-purple-700",
        secondary:
          "bg-dream-blue-100 text-dream-blue-700 hover:bg-dream-blue-200",
        ghost:
          "hover:bg-dream-purple-100 hover:text-dream-purple-700",
        link: "text-dream-purple-600 underline-offset-4 hover:underline",
        magic:
          "bg-gradient-to-r from-dream-purple-500 via-dream-pink-300 to-dream-blue-400 text-white hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105 animate-pulse-soft",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
