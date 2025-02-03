import { memo, ButtonHTMLAttributes } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";

type ButtonSize = "sm" | "lg";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: ButtonVariant;
  classes?: string;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export const ActionButton = memo(({ variant, classes, size, isLoading, onClick, disabled, children, ...rest }: ActionButtonProps) => (
  <Button
    variant={variant}
    {...(size && { size })}
    className={`rounded-3 ${classes}`}
    onClick={onClick}
    disabled={disabled || isLoading}
    aria-label={typeof children === 'string' ? children : undefined}
    {...rest}
  >
    {isLoading ? (
      <Spinner animation="border" size="sm" className="mx-2" />
    ) : children}
  </Button> 
));

ActionButton.displayName = 'ActionButton';

  