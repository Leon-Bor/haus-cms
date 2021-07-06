import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TokenGuard } from '../../guards/token.guard';
import { DatabaseService } from '../../services/database/database.service';

let env = dotenv.config().parsed;
@Controller(env?.adminPath)
export class AdminController {
  constructor(private databaseService: DatabaseService) {}

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
