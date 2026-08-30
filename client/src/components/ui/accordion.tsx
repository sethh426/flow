import * as React from "react"
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  type AccordionProps as MuiAccordionProps
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { cn } from "@/lib/utils"

const Accordion = MuiAccordion

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  MuiAccordionProps & { value?: string }
>(({ className, ...props }, ref) => (
  <MuiAccordion ref={ref} className={cn(className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionSummary>
>(({ className, children, ...props }, ref) => (
  <AccordionSummary
    expandIcon={<ExpandMoreIcon />}
    ref={ref}
    className={cn(className)}
    {...props}
  >
    {children}
  </AccordionSummary>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionDetails>
>(({ className, children, ...props }, ref) => (
  <AccordionDetails ref={ref} className={cn(className)} {...props}>
    {children}
  </AccordionDetails>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
