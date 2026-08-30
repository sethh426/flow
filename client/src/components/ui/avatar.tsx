import * as React from "react"
import { Avatar as MuiAvatar, type AvatarProps as MuiAvatarProps } from '@mui/material';
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  MuiAvatarProps
>(({ className, ...props }, ref) => (
  <MuiAvatar ref={ref} className={cn(className)} {...props} />
))
Avatar.displayName = "Avatar"

const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) => {
  return <img src={src} alt={alt} />
}

const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export { Avatar, AvatarImage, AvatarFallback }
