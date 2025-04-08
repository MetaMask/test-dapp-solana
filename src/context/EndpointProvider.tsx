import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { RPC_HTTP_ENDPOINT } from '../config';

const LOCAL_STORAGE_KEY = 'rpc_http_endpoint';

type EndpointContextType = {
  endpoint: string;
  setEndpoint: (value: string) => void;
};

const EndpointContext = createContext<EndpointContextType | undefined>(undefined);

/**
 * EndpointProvider component
 */
export const EndpointProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [endpoint, setEndpoint] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? RPC_HTTP_ENDPOINT;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, endpoint);
  }, [endpoint]);

  return <EndpointContext.Provider value={{ endpoint, setEndpoint }}>{children}</EndpointContext.Provider>;
};

/**
 * Custom hook to use the EndpointContext
 */
export const useEndpoint = (): EndpointContextType => {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error('useEndpoint must be used within an EndpointProvider');
  }
  return context;
};
