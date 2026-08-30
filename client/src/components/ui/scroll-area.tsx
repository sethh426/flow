import * as React from "react"
import { Box, type BoxProps } from '@mui/material';
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, children, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("overflow-auto", className)}
    sx={{ maxHeight: '100%', ...props.sx }}
    {...props}
  >
    {children}
  </Box>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
