import * as React from "react"
import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectProps as MuiSelectProps,
  type SelectChangeEvent
} from '@mui/material';
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange, ...props }: any) => {
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onValueChange?.(event.target.value)
  }

  return (
    <FormControl fullWidth size="small">
      <MuiSelect
        value={value}
        onChange={handleChange}
        {...props}
      >
        {children}
      </MuiSelect>
    </FormControl>
  )
}

const SelectTrigger = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectItem = ({ value, children, ...props }: any) => {
  return (
    <MenuItem value={value} {...props}>
      {children}
    </MenuItem>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
