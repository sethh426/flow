import * as React from "react"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} style={{ marginTop: 'auto', padding: '16px 0' }} {...props} />
)

export { SheetFooter }
