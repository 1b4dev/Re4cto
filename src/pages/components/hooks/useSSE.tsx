import { useState, useEffect, useRef, useCallback } from 'react';

interface SSEOptions {
  withCredentials?: boolean;
  onOpen?: () => void;
  onError?: (event: Event) => void;
}

function useSSE<T>(
  endpoint: string | null,
  eventName: string = 'message',
  options: SSEOptions = {}
): {
  data: T | null;
  error: Error | null;
  isConnected: boolean;
} {
  const apiURL = import.meta.env.VITE_API_URL as string;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const endpointRef = useRef<string | null>(endpoint);
  const isConnectingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const maxRetries = 5;
  const retryDelay = 3000;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  const connectToSSE = useCallback(async () => {
    if (!mountedRef.current || isConnectingRef.current || !endpointRef.current) {
      return;
    }

    if (isConnected && eventSourceRef.current) {
      return;
    }

    isConnectingRef.current = true;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      if (mountedRef.current) {
        setIsConnected(false);
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let sseToken = sessionStorage.getItem('sseToken');

      if (!sseToken) {
        const response = await fetch(`${apiURL}sseauth`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to authenticate SSE connection: ${errorText}`);
        }
        
        const sessionData = await response.json();
        sseToken = sessionData.sseToken;
        sessionStorage.setItem('sseToken', sessionData.sseToken);
        
        if (!sseToken) {
          throw new Error('No session token received from server');
        }
      }
      
      const url = `${apiURL}${endpointRef.current.startsWith('/') ? endpointRef.current.substring(1) : endpointRef.current}`;
      const fullUrl = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(sseToken)}`;
      
      const newEventSource = new EventSource(fullUrl, {
        withCredentials: options.withCredentials || false
      });
      eventSourceRef.current = newEventSource;

      const handleMessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;
        if (retryCountRef.current > 0) {
          console.log("Connection reestablished, resetting retries");
        }
        retryCountRef.current = 0;
        
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
          setError(error instanceof Error ? error : new Error('Data parsing error'));
        }
      };

      newEventSource.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        isConnectingRef.current = false;
        if (options.onOpen) options.onOpen();
      };

      newEventSource.onerror = (event) => {
        if (!mountedRef.current) return;
        console.error('SSE error event', event);
        setError(new Error('SSE Connection error'));
        setIsConnected(false);
        isConnectingRef.current = false;
        sessionStorage.removeItem('sseToken');
        if (options.onError) options.onError(event);
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`Attempting to reconnect... (attempt ${retryCountRef.current}/${maxRetries})`);
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(() => {
            connectToSSE();
          }, retryDelay);
        } else {
          console.error(`Max reconnection attempts (${maxRetries}) reached. Stopping retries.`);
          if (newEventSource.readyState !== EventSource.CLOSED) {
            newEventSource.close();
          }
          eventSourceRef.current = null;
          retryCountRef.current = 0;
          sessionStorage.removeItem('sseToken');
        }
      };

      newEventSource.addEventListener(eventName, handleMessage as EventListener);

    } catch (error) {
      if (!mountedRef.current) return;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error setting up SSE';
      console.error('Error setting up SSE:', errorMessage);
      setError(error instanceof Error ? error : new Error(errorMessage));
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, [apiURL, eventName, options.onError, options.onOpen, options.withCredentials]);

  useEffect(() => {
    if (endpoint) {
      connectToSSE();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    }
  }, [endpoint, connectToSSE]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      isConnectingRef.current = false;
      if (mountedRef.current) {
        setIsConnected(false);
      }
      retryCountRef.current = 0;
    };
  }, []);

  return { data, error, isConnected };
}

export default useSSE;