import * as React from "react"
import { TextField, type TextFieldProps } from '@mui/material';
import { cn } from "@/lib/utils"

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", variant = "outlined", ...props }, ref) => {
    return (
      <TextField
        type={type}
        className={cn(className)}
        inputRef={ref}
        variant={variant}
        fullWidth
        size="small"
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
