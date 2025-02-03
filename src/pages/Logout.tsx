import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from './components/useApi';
import Spinner from 'react-bootstrap/Spinner';

function Logout() {
  const navigate = useNavigate();
  const { fetchData } = useApi();

  useEffect(() => {
    const logout = async () => {
      try {
        const data = await fetchData('logout', 'POST');
        localStorage.removeItem('token');
        navigate('/login', { state: { message: data.message, variant: 'success' } });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    logout();
  }, [fetchData, navigate]);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <Spinner
        animation="border" 
        variant="primary"
        className="m-auto"
      />
    </div>
  )
}

export default Logout;