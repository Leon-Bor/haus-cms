import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { AuthGuard } from '../guards/auth.guard';
import { SocketError, SocketSuccess } from '../helper/socket-return-messages';
import { SocketMessage } from '../models/classes/socket-message.model';
import { SocketRoutes } from '../models/enums/socket-routes.enum';
import { IClientSocket } from '../models/interfaces/client-socket.interface';

@WebSocketGateway()
export class WebsiteEditorGateway {
  private logger: Logger = new Logger('WebsiteEditorGateway');

  // PAGE ACTIONS
  @SubscribeMessage(SocketRoutes.CS_LIST_PAGE)
  @UseGuards(AuthGuard)
  async handleListPage(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): Promise<SocketMessage<any>> {
    try {
      this.logger.log(SocketRoutes.CS_LIST_PAGE);
      const data = await readdir(join(__dirname, '..', 'website', 'pages'));
      return SocketSuccess(SocketRoutes.SC_LIST_PAGE, client, data);
    } catch (error) {
      this.logger.error(error);

      return SocketError(
        SocketRoutes.SC_LIST_PAGE,
        client,
        'Reading page dir failed.',
      );
    }
  }

  @SubscribeMessage(SocketRoutes.CS_CREATE_PAGE)
  @UseGuards(AuthGuard)
  handleCreatePage(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_CREATE_PAGE, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_UPDATE_PAGE)
  @UseGuards(AuthGuard)
  handleUpdatePage(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_UPDATE_PAGE, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_DELETE_PAGE)
  @UseGuards(AuthGuard)
  handleDeletePage(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_DELETE_PAGE, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  // COMPONENTS ACTIONS
  @SubscribeMessage(SocketRoutes.CS_LIST_COMPONENT)
  @UseGuards(AuthGuard)
  async handleListComponent(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): Promise<SocketMessage<any>> {
    try {
      this.logger.log(SocketRoutes.CS_LIST_COMPONENT);
      const data = await readdir(
        join(__dirname, '..', 'website', 'components'),
      );
      return SocketSuccess(SocketRoutes.SC_LIST_COMPONENT, client, data);
    } catch (error) {
      this.logger.error(error);
      return SocketError(
        SocketRoutes.SC_LIST_COMPONENT,
        client,
        'Reading components dir failed.',
      );
    }
  }

  @SubscribeMessage(SocketRoutes.CS_CREATE_COMPONENT)
  @UseGuards(AuthGuard)
  handleCreateComponent(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_CREATE_COMPONENT, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_UPDATE_COMPONENT)
  @UseGuards(AuthGuard)
  handleUpdateComponent(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_UPDATE_COMPONENT, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_DELETE_COMPONENT)
  @UseGuards(AuthGuard)
  handleDeleteComponent(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_DELETE_COMPONENT, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  // ASSET ACTIONS
  @SubscribeMessage(SocketRoutes.CS_LIST_ASSET)
  @UseGuards(AuthGuard)
  async handleListAsset(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): Promise<SocketMessage<any>> {
    try {
      this.logger.log(SocketRoutes.CS_LIST_ASSET);
      const data = await readdir(join(__dirname, '..', 'website', 'assets'));
      return SocketSuccess(SocketRoutes.CS_LIST_ASSET, client, data);
    } catch (error) {
      this.logger.error(error);
      return SocketError(
        SocketRoutes.SC_LIST_COMPONENT,
        client,
        'Reading assets dir failed.',
      );
    }
  }

  @SubscribeMessage(SocketRoutes.CS_CREATE_ASSET)
  @UseGuards(AuthGuard)
  handleCreateAsset(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_CREATE_ASSET, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_UPDATE_ASSET)
  @UseGuards(AuthGuard)
  handleUpdateAsset(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_UPDATE_ASSET, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(SocketRoutes.CS_DELETE_ASSET)
  @UseGuards(AuthGuard)
  handleDeleteAsset(
    @MessageBody() m: SocketMessage<any>,
    @ConnectedSocket() client: IClientSocket,
  ): WsResponse<unknown> {
    try {
      return { event: SocketRoutes.SC_DELETE_ASSET, data: null };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
