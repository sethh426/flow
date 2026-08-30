import * as React from "react"
import { FormControl as MuiFormControl, FormHelperText, FormLabel as MuiFormLabel, type FormControlProps } from '@mui/material';
import { cn } from "@/lib/utils"
import type { FieldValues, UseFormReturn, FieldPath, ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form"

// Simple form context
type FormContextValue = {
  form: UseFormReturn<any>
}

const FormContext = React.createContext<FormContextValue | null>(null)

const useFormField = () => {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error("useFormField must be used within Form")
  }
  return context
}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<any>
}

const Form = ({ form, children, ...props }: FormProps) => {
  return (
    <FormContext.Provider value={{ form }}>
      <form {...props}>{children}</form>
    </FormContext.Provider>
  )
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2 mb-4", className)} {...props} />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof MuiFormLabel>
>(({ className, ...props }, ref) => {
  return (
    <MuiFormLabel
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  FormControlProps
>(({ ...props }, ref) => {
  return (
    <MuiFormControl ref={ref} fullWidth {...props} />
  )
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null
  }

  return (
    <FormHelperText
      ref={ref}
      className={cn("text-sm text-red-600", className)}
      error
      {...props}
    >
      {children}
    </FormHelperText>
  )
})
FormMessage.displayName = "FormMessage"

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<TFieldValues>
  }) => React.ReactElement
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  render,
}: FormFieldProps<TFieldValues, TName>) => {
  const { form } = useFormField()
  const fieldState = form.getFieldState(name, form.formState)
  
  return render({
    field: form.register(name) as any,
    fieldState,
    formState: form.formState,
  })
}

export { Form, FormItem, FormLabel, FormControl, FormMessage, FormField }
