import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({ notifications: [], markAllRead: () => {}, socket: null });

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit('join_room', user._id);

    socketRef.current.on('issue_updated', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Issue status updated to "${data.status}"${data.remark ? ': ' + data.remark : ''}`,
          read: false,
          issueId: data.issueId,
        },
        ...prev,
      ]);
    });

    socketRef.current.on('new_issue', () => {
      // Government side - can trigger a refresh
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
