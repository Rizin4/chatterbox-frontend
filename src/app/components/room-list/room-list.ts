import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RoomService } from '../../services/room';
import { ChatRoom } from '../../models/message.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule,
            MatInputModule, MatIconModule, MatDialogModule],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css'
})
export class RoomList implements OnInit {

  rooms: ChatRoom[] = [];
  newRoomName: string = '';
  username: string = '';

  constructor(private roomService: RoomService, private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) {
      this.router.navigate(['/']);
      return;
    }
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.ngZone.run(() => {
       this.rooms = rooms;
      });
    });
  }

  createRoom(): void {
    if (!this.newRoomName.trim()) return;

    const room: ChatRoom = {
      roomId: this.newRoomName.toLowerCase().replace(/\s+/g, '_'),
      roomName: this.newRoomName.trim()
    };

    this.roomService.createRoom(room).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.newRoomName = '';
          this.loadRooms();
        });
      },
      error: () => alert('Room already exists!')
    });
  }

  joinRoom(roomId: string): void {
    this.router.navigate(['/chat', roomId, this.username]);
  }

  logout(): void {
    localStorage.removeItem('username');
    this.router.navigate(['/']);
  }
}