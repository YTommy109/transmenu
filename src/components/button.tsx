import { css } from '@emotion/react';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const getBackgroundColor = (variant: 'primary' | 'secondary'): string => {
  return variant === 'primary' ? '#3b82f6' : '#6b7280';
};

const getHoverColor = (
  disabled: boolean,
  variant: 'primary' | 'secondary'
): string => {
  if (disabled) return 'inherit';
  return variant === 'primary' ? '#2563eb' : '#4b5563';
};

const buttonStyles = (
  variant: 'primary' | 'secondary',
  disabled: boolean
) => css`
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 500;
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  opacity: ${disabled ? 0.6 : 1};
  background-color: ${getBackgroundColor(variant)};
  color: white;
  
  &:hover {
    background-color: ${getHoverColor(disabled, variant)};
  }
`;

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type="button"
      css={buttonStyles(variant, disabled)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
