import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Notification } from '../models/classes/notification.model';
import { SocketMessage } from '../models/classes/socket-message.model';
import { NotificationKeys } from '../models/enums/notification-keys.enum';
import { NotificationTypes } from '../models/enums/notification-types.enum';
import { SocketRoutes } from '../models/enums/socket-routes.enum';
import { IClientSocket } from '../models/interfaces/client-socket.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger: Logger = new Logger('AuthGuard');
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const client = context.switchToWs().getClient<IClientSocket>();
      if (!client.adminToken) {
        this.logger.warn(`${client.id} is not authenticated`);
        client.emit(
          SocketRoutes.SC_SEND_NOTIFICATION,
          new SocketMessage({
            data: new Notification({
              type: NotificationTypes.ERROR,
              key: NotificationKeys.NOT_AUTHENTICATED,
            }),
          })
        );
      }
      return !!client.adminToken;
    } catch (e) {
      this.logger.error(`${e.code}: ${e.message}`);
      return false;
    }
  }
}
