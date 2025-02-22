import { useEffect, useRef, useCallback, DependencyList } from 'react';

type CallbackFunction = (signal: AbortSignal) => void | Promise<void>;

let pollCounter = 0;

function usePoll(callback: CallbackFunction, interval: number = 10000, dependencies: DependencyList = []) {
  const activeRef = useRef<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const pollIDRef = useRef<number>(0);

  useEffect(() => {
    pollIDRef.current = pollCounter++;
  }, []);

  const pollCleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    activeRef.current = false;
  }, [])

  useEffect(() => {
    pollCleanup();

    if(!dependencies.some(dep => dep !== undefined && dep !== null)) {
      return;
    }

    activeRef.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;

    const executePoll = async () => {
      if (!activeRef.current) return;
      try {
        await callback(controller.signal);
      } catch (error) {
        console.error(error);
      }
    }
    executePoll();
    intervalRef.current = setInterval(executePoll, interval);
    return () => {
      pollCleanup();
    };
  }, [pollCleanup, callback, interval, ...dependencies]);
}

export default usePoll;