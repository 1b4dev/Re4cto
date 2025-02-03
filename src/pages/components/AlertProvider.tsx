import { memo } from 'react';
import Alert from 'react-bootstrap/Alert';

type AlertVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | string;

interface AlertProps {
  alert: {
    show: boolean;
    message: string;
    variant: AlertVariant;
  };
  onClose: () => void;
}

const AlertProvider = ({ alert, onClose }: AlertProps) => (
  alert.show && (
    <Alert
      onClose={onClose} 
      variant={alert.variant} 
      className="mb-2 text-start" 
      aria-live="assertive"
      dismissible
    >
      {alert.message}
    </Alert>
  )
);

AlertProvider.displayName = 'AlertProvider';

export default memo(AlertProvider);
