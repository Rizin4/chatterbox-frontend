import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRoom, ChatMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'https://chatterbox-backend-keal.onrender.com/api/rooms';;

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(this.apiUrl);
  }

  createRoom(room: ChatRoom): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(this.apiUrl, room);
  }

  getMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${roomId}/messages`);
  }
}