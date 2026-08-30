import * as React from "react"
import { Alert as MuiAlert, AlertTitle as MuiAlertTitle } from '@mui/material';
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MuiAlert>
>(({ className, ...props }, ref) => (
  <MuiAlert ref={ref} className={cn(className)} {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = MuiAlertTitle

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
