import * as React from "react"
import { TextField, type TextFieldProps } from '@mui/material';
import { cn } from "@/lib/utils"

export interface TextareaProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "outlined", ...props }, ref) => {
    return (
      <TextField
        className={cn(className)}
        inputRef={ref}
        variant={variant}
        fullWidth
        multiline
        rows={4}
        size="small"
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
