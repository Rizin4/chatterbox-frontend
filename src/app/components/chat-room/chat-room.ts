import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { WebsocketService } from '../../services/websocket';
import { RoomService } from '../../services/room';
import { ChatMessage } from '../../models/message.model';


@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule,
            MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.css'
})
export class ChatRoom implements OnInit, OnDestroy {

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  roomId: string = '';
  username: string = '';
  newMessage: string = '';
  messages: ChatMessage[] = [];
  connected: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wsService: WebsocketService,
    private roomService: RoomService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.username = this.route.snapshot.paramMap.get('username') || '';

    if (!this.roomId || !this.username) {
      this.router.navigate(['/']);
      return;
    }

    // Load chat history first
    this.roomService.getMessages(this.roomId).subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });

    // Connect to WebSocket
    this.wsService.connect(this.roomId, () => {
      this.ngZone.run(() => {
        this.connected = true;
        const joinMessage: ChatMessage = {
          sender: this.username,
          content: '',
          roomId: this.roomId,
          type: 'JOIN'
        };
        this.wsService.joinRoom(this.roomId, joinMessage);
      });
    });

    // Listen for incoming messages
    this.wsService.messages$.subscribe(message => {
      this.ngZone.run(() => {
        this.messages.push(message);
        this.scrollToBottom();
      });
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.connected) return;

    const message: ChatMessage = {
      sender: this.username,
      content: this.newMessage.trim(),
      roomId: this.roomId,
      type: 'CHAT'
    };

    this.wsService.sendMessage(this.roomId, message);
    this.newMessage = '';
  }

  leaveRoom(): void {
    const leaveMessage: ChatMessage = {
      sender: this.username,
      content: '',
      roomId: this.roomId,
      type: 'LEAVE'
    };
    this.wsService.leaveRoom(this.roomId, leaveMessage);
    this.wsService.disconnect();
    this.router.navigate(['/rooms']);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.sender === this.username;
  }

  isSystemMessage(message: ChatMessage): boolean {
    return message.type === 'JOIN' || message.type === 'LEAVE';
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}