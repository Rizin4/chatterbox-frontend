import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RoomList } from './components/room-list/room-list';
import { ChatRoom } from './components/chat-room/chat-room';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'rooms', component: RoomList },
  { path: 'chat/:roomId/:username', component: ChatRoom },
  { path: '**', redirectTo: '' }
];