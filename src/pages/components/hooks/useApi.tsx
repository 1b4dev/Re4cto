import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useError } from './useError';

type AuthType = 'bearer' | 'cookie'

function useApi(initialLoading: boolean = false) {
  const [loading, setLoading] = useState(initialLoading);
  const navigate = useNavigate();
  const handleError = useError();
  const loadingCount = useRef(0); 

  const apiURL = import.meta.env.VITE_API_URL;
  const authType = (import.meta.env.VITE_AUTH_TYPE || 'bearer') as AuthType;

  const fetchData = useCallback(async (endpoint: string, method: string = 'GET', body: any = null, customHeaders: Record<string, string> = {}, requiresAuth: boolean = true, signals: RequestInit = {}): Promise<any> => {
    setLoading(true);
    loadingCount.current++;
    let isAborted = false;

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': window.origin,
        ...(token && requiresAuth && authType ==='bearer' && { Authorization: `Bearer ${token}` }),
        ...customHeaders
      };

      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        credentials: authType  === 'cookie' ? 'include' : 'omit',
        ...signals, 
      };

      const response = await fetch(`${apiURL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { state: { message: 'Session expired', variant: 'warning' } });        }
        throw new Error(`API response: (${response.status}) ${data.error}`);
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        isAborted = true;
        console.error(endpoint, 'request aborted')
        throw error;
      }
      handleError(error.response ? error.response.data : error.message);
      console.error(error);
      throw error;
    } finally {
      loadingCount.current--;
      if (loadingCount.current === 0 && !isAborted) {
        setLoading(false);
      }
    }
  }, [navigate, apiURL, authType, handleError]);

  return { fetchData, loading };
}

export default useApi;