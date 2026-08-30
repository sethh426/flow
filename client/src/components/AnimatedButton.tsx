'use client';

import React, { useState, MouseEvent } from 'react';
import { Button, ButtonProps, Box } from '@mui/material';

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean;
}

export default function AnimatedButton({ 
  children, 
  ripple = true,
  ...props 
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...props.sx,
      }}
    >
      {children}
      {ripple && ripples.map((ripple) => (
        <Box
          key={ripple.id}
          sx={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none',
            '@keyframes ripple': {
              to: {
                width: '200px',
                height: '200px',
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Button>
  );
}
