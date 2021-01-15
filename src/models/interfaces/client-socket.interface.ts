import { Socket } from 'socket.io';

export interface IClientSocket extends Socket {
  adminToken: string;
}
