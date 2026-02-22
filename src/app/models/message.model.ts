export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  roomId: string;
  timestamp?: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

export interface ChatRoom {
  roomId: string;
  roomName: string;
}