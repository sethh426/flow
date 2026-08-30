import * as React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const AlertDialog = Dialog

const AlertDialogTrigger = ({ children, asChild, ...props }: any) => {
  return React.cloneElement(children, props)
}

const AlertDialogContent = DialogContent

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const AlertDialogTitle = DialogTitle

const AlertDialogDescription = DialogContentText

const AlertDialogFooter = DialogActions

const AlertDialogAction = ({ children, ...props }: any) => {
  return (
    <Button variant="contained" {...props}>
      {children}
    </Button>
  )
}

const AlertDialogCancel = ({ children, ...props }: any) => {
  return (
    <Button variant="outlined" {...props}>
      {children}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
}
