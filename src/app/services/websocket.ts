import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { ChatMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private client!: Client;
  private messageSubject = new Subject<ChatMessage>();
  public messages$ = this.messageSubject.asObservable();

  connect(roomId: string, onConnected: () => void): void {
    this.client = new Client({
      brokerURL: 'wss://chatterbox-backend-keal.onrender.com/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        this.client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          this.messageSubject.next(chatMessage);
        });
        onConnected();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      }
    });

    this.client.activate();
  }

  sendMessage(roomId: string, message: ChatMessage): void {
    this.client.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message)
    });
  }

  joinRoom(roomId: string, message: ChatMessage): void {
    this.client.publish({
      destination: `/app/join/${roomId}`,
      body: JSON.stringify(message)
    });
  }

  leaveRoom(roomId: string, message: ChatMessage): void {
    this.client.publish({
      destination: `/app/leave/${roomId}`,
      body: JSON.stringify(message)
    });
  }

  disconnect(): void {
    if (this.client && this.client.active) {
      this.client.deactivate();
    }
  }
}