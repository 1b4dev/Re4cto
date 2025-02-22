import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import FormField from './components/FormField';
import AlertProvider from './components/AlertProvider';
import { ActionButton } from './components/ActionButton';
import { initialLoginState, initialAlertState, formFields } from './components/LoginComponents';
import useApi from './components/hooks/useApi';

import logo from '/logo.png';

interface LoginDataType {
  username: string;
  password: string;
  remember: boolean;
}

interface AlertState {
  show: boolean;
  message: string;
  variant: string;
}

interface LocationState {
  state?: {
    message?: string;
    variant?: string;
    from?: string;
  };
  pathname: string;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation() as LocationState;
  const version = import.meta.env.VITE_REACT_APP_VERSION;
  const { fetchData, loading } = useApi();

  const [loginData, setLoginData] = useState<LoginDataType>({...initialLoginState, remember: false});
  const [alert, setAlert] = useState<AlertState>(initialAlertState);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<boolean>(false);

  const isLoggedIn = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.from){
      setRedirect(location.state.from);
    }
    if (location.state?.message) {
      setAlert({
        show: true,
        message: location.state.message,
        variant: location.state.variant || 'warning'
      });

      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);

  const showAlert = useCallback((message: string, variant: string = 'danger') => {
    setAlert({
      show: true,
      message,
      variant
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target; 
    const finalValue = type === 'checkbox' ? checked : value;
  
    setLoginData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  
    if (loginError) {
      setLoginError(false);
    }
  }, [loginError]);

  const handleLogin = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await fetchData('login', 'POST', loginData, {}, false);
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate(redirect ?? '/')
      } else if (data.error) {
        showAlert(data.error);
        setLoginError(true);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Error in handleLogin:', error.message); 
    }
  }, [fetchData, loginData, redirect, showAlert, setLoginError, navigate])

  return (
    <Container className="position-absolute top-50 start-50 translate-middle">
      <Row className="d-flex justify-content-center align-items-center">
        <Col xs={10} sm={8} md={6} lg={5} xl={4} xxl={3}>
          <Form className="w-100 text-center" onSubmit={handleLogin}>
            <img className="mb-2" src={logo} alt="Re4cto Client Logo" width="72" height="72"/>
            <h1 className="h3 mb-4 fw-normal">Please sign in</h1>
            <AlertProvider alert={alert} onClose={hideAlert} />
            {formFields.map(field => (
              <FormField
                key={field.id}
                field={field}
                value={loginData[field.id]}
                onChange={handleChange}
                isInvalid={loginError}
              />
            ))}
            <Form.Group className="text-start ms-2 my-3">
              <Form.Check
                type="switch"
                id="remember"
                name="remember"
                label="Remember me"
                checked={loginData.remember}
                onChange={handleChange}
              />
            </Form.Group>  
            <ActionButton
              type="submit"
              classes="w-100 py-2"
              disabled={loading}
              isLoading={loading}
            >
              Sign in
            </ActionButton>
            <p className="mt-5 mb-3 text-body-secondary">©{new Date().getFullYear()} Re4cto Client v{version} | Created by 1B4dev</p>
          </Form>
        </Col>
      </Row>
    </Container> 
  );
};

export default Login;