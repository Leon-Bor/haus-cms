import { SocketMessage } from '../models/classes/socket-message.model';
import { SocketRoutes } from '../models/enums/socket-routes.enum';
import { IClientSocket } from '../models/interfaces/client-socket.interface';

export const SocketSuccess = (r: SocketRoutes, c: IClientSocket, data: any) => {
  const sm = new SocketMessage({ data: data, status: 200 });
  c.emit(r, sm);
  return sm;
};

export const SocketError = (r: SocketRoutes, c: IClientSocket, msg: string) => {
  const sm = new SocketMessage({ data: msg, status: 400 });
  c.emit(r, sm);
  return sm;
};
