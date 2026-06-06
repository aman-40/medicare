import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  public connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public onQueueUpdated(callback: (data: { currentToken: number; waitTime: number }) => void) {
    if (this.socket) {
      this.socket.on('queue-updated', callback);
    }
  }
}

export const socketService = new SocketService();
