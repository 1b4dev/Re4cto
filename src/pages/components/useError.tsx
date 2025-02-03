import { createContext, useContext, useState } from 'react';
import Toast from "react-bootstrap/Toast";
import ToastContainer from 'react-bootstrap/ToastContainer';

type ErrorContextType = (errorMessage: string) => void;

const ErrorContext = createContext<ErrorContextType | null>(null);

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowErrorToast(true);
  };

  return (
    <ErrorContext.Provider value={handleError}>
      {children}
      <ToastContainer className="p-3 position-fixed" position="bottom-center">
        <Toast 
          bg="danger" 
          className="text-white" 
          show={showErrorToast} 
          onClose={() => setShowErrorToast(false)} 
          delay={5000} 
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">API Request Error</strong>
          </Toast.Header>
          <Toast.Body>{error}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}