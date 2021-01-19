import { Body, Controller, Get, Logger, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import { FileService } from '../../services/file/file.service';
import { ViewService } from '../../services/view/view.service';
import { DatabaseService } from '../../services/database/database.service';

let env = dotenv.config().parsed;
@Controller(env?.adminPath)
export class AdminController {
  constructor(private viewService: ViewService, private databaseService: DatabaseService) {}

  @Post('content')
  getSitemap(@Body() body: { image; innerHtml }): boolean {
    try {
      console.log(body);

      const { innerHtml, image } = body;

      Object.keys(innerHtml).map((k) => {
        this.databaseService.updateInnerHtml(k, innerHtml[k]);
      });

      return true;
    } catch {
      return this.viewService.render('error-500');
    }
  }
}
