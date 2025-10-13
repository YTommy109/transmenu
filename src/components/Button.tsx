import { css } from '@emotion/react';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  return (
    <button
      css={css`
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        border: none;
        font-weight: 500;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? 0.6 : 1};
        background-color: ${variant === 'primary' ? '#3b82f6' : '#6b7280'};
        color: white;
        
        &:hover {
          background-color: ${
            !disabled && variant === 'primary' ? '#2563eb' : 
            !disabled && variant === 'secondary' ? '#4b5563' : 
            'inherit'
          };
        }
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}