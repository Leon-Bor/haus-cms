import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadController } from './controllers/upload/upload.controller';
import { WebsiteController } from './controllers/website/website.controller';
import { AuthGateway } from './gateways/auth.gateway';
import { FileService } from './services/file/file.service';
import { DatabaseService } from './services/database/database.service';
import { TemplateService } from './services/template/template.service';
import { ViewService } from './services/view/view.service';
import { PageService } from './services/page/page.service';
import { HtmlParserService } from './services/html-parser/html-parser.service';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    //   serveRoot: process.env?.adminPath,
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'website', 'assets'),
    }),
    MulterModule.register({
      dest: join(__dirname),
    }),
  ],
  controllers: [UploadController, WebsiteController],
  providers: [DatabaseService, TemplateService, ViewService, AuthGateway, FileService, PageService, HtmlParserService],
})
export class AppModule {}
