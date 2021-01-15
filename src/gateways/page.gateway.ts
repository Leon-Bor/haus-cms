import { Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { AuthGuard } from '../guards/auth.guard';
import { SocketRoutes } from '../models/enums/socket-routes.enum';
import { IClientSocket } from '../models/interfaces/client-socket.interface';

@WebSocketGateway()
export class PageGateway {
  private logger: Logger = new Logger('PageGateway');

  @SubscribeMessage(SocketRoutes.CS_LIST_PAGE)
  @UseGuards(AuthGuard)
  handleListPage(@MessageBody() data: string, @ConnectedSocket() client: IClientSocket): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_LIST_PAGE, data };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_CREATE_PAGE)
  @UseGuards(AuthGuard)
  handleCreatePage(@MessageBody() data: string, @ConnectedSocket() client: IClientSocket): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_CREATE_PAGE, data };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_UPDATE_PAGE)
  @UseGuards(AuthGuard)
  handleUpdatePage(@MessageBody() data: string, @ConnectedSocket() client: IClientSocket): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_UPDATE_PAGE, data };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_DELETE_PAGE)
  @UseGuards(AuthGuard)
  handleDeletePage(@MessageBody() data: string, @ConnectedSocket() client: IClientSocket): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_DELETE_PAGE, data };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
