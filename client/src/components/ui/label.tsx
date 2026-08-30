'use client';

import React, { forwardRef } from 'react';
import { Typography, TypographyProps } from '@mui/material';

export interface LabelProps extends TypographyProps {
  htmlFor?: string;
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, htmlFor, required, sx, ...props }, ref) => {
    return (
      <Typography
        component="label"
        htmlFor={htmlFor}
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 0.5,
          display: 'block',
          ...sx,
        }}
        {...props}
        ref={ref}
      >
        {children}
        {required && (
          <Typography
            component="span"
            sx={{
              color: 'error.main',
              ml: 0.5,
            }}
          >
            *
          </Typography>
        )}
      </Typography>
    );
  }
);

Label.displayName = 'Label';

export default Label;
export { Label };