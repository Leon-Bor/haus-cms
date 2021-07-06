import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SocketMessage } from '../models/classes/socket-message.model';
import { SocketRoutes } from '../models/enums/socket-routes.enum';
import { IClientSocket } from '../models/interfaces/client-socket.interface';
import { DatabaseService } from '../services/database/database.service';

@WebSocketGateway()
export class AuthGateway {
  private logger: Logger = new Logger('AuthGateway');

  constructor(private databaseService: DatabaseService) {}

  handleDisconnect(client: IClientSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    client.leaveAll();
  }

  handleConnection(client: IClientSocket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage(SocketRoutes.CS_AUTHENTICATE)
  async handleMessage(
    @ConnectedSocket() client: IClientSocket,
    @MessageBody() m: SocketMessage<string>,
  ): Promise<any> {
    try {
      const adminToken = m.data;
      if (adminToken) {
        if (adminToken === process.env?.adminToken) {
          console.log(SocketRoutes.CS_AUTHENTICATE, true);
          client.adminToken = adminToken;
          return {
            event: SocketRoutes.SC_AUTHENTICATE,
            data: new SocketMessage<any>({
              data: {
                isAuthenticated: true,
                settings: this.databaseService.getItem('settings'),
              },
            }),
          };
        } else {
          return {
            event: SocketRoutes.SC_AUTHENTICATE,
            data: new SocketMessage<boolean>({ data: false }),
          };
        }
      } else {
        return {
          event: SocketRoutes.SC_AUTHENTICATE,
          data: new SocketMessage<boolean>({ data: false }),
        };
      }
    } catch (e) {
      this.logger.error(
        `Token validation failed: ${e.statusCode} ${e.message}`,
      );
      return new SocketMessage<boolean>({ data: false });
    }
  }
}
