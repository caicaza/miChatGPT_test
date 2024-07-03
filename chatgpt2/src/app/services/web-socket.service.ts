import { Injectable, EventEmitter, Output } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  @Output() outEvent: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.socket = io(environment.serverSocket); // URL del servidor socket
  }

  joinRoom(userId: string) {
    this.socket.emit('joinRoom', userId);
  }

  sendMessage(userId: string, message: string) {
    this.socket.emit('newMessage', { userId, message });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket.on('newMessage', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}