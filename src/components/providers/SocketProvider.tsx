"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { getSocket, resetSocket } from "@/lib/socket";
import { getClientToken } from "@/lib/auth/cookies.client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setToken(getClientToken());
    read();

    const onFocus = () => read();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(read, 2000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      resetSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const instance = getSocket();
    instance.auth = { token };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = (err: Error) => {
      console.error("[Socket] Connection error:", err.message);
      setIsConnected(false);
    };

    instance.on("connect", handleConnect);
    instance.on("disconnect", handleDisconnect);
    instance.on("connect_error", handleConnectError);

    if (!instance.connected) {
      instance.connect();
    } else {
      setIsConnected(true);
    }

    setSocket(instance);

    return () => {
      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.off("connect_error", handleConnectError);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
export const useSocket = useSocketContext;
