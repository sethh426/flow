import * as React from "react"
import { Divider, type DividerProps } from '@mui/material';
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  HTMLHRElement,
  DividerProps
>(({ className, ...props }, ref) => (
  <Divider ref={ref} className={cn(className)} {...props} />
))
Separator.displayName = "Separator"

export { Separator }
