import { Body, Controller, Get, Header, Logger, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import { FileService } from '../../services/file/file.service';
import { ViewService } from '../../services/view/view.service';
import { DatabaseService } from '../../services/database/database.service';
import { TokenGuard } from '../../guards/token.guard';

let env = dotenv.config().parsed;
@Controller(env?.adminPath)
export class AdminController {
  constructor(private viewService: ViewService, private databaseService: DatabaseService) {}

  @Post('content')
  @UseGuards(TokenGuard)
  getSitemap(@Body() body: { image; innerHtml }): boolean {
    try {
      const { innerHtml, image } = body;
      console.log(innerHtml);
      Object.keys(innerHtml).map((k) => {
        this.databaseService.updateInnerHtml(k, innerHtml[k]);
      });

      return true;
    } catch {
      return false;
    }
  }

  @Post('authenticate')
  @UseGuards(TokenGuard)
  authenticate(@Query() query: any): boolean {
    try {
      const { edit } = query;
      return this.databaseService.getItem('settings');
    } catch {
      return false;
    }
  }
}
