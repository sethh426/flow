import * as React from "react"
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "",
      },
      size: {
        default: "",
        sm: "",
        lg: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Map variant to MUI variant
    const muiVariant = variant === 'outline' ? 'outlined' : variant === 'ghost' || variant === 'link' ? 'text' : 'contained';
    const muiSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';
    const muiColor = variant === 'destructive' ? 'error' : variant === 'secondary' ? 'secondary' : 'primary';
    
    return (
      <MuiButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        variant={muiVariant}
        size={muiSize}
        color={muiColor as any}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
