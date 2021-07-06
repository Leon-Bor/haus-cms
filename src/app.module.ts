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
import { PageService } from './services/page/page.service';
import { HtmlParserService } from './services/html-parser/html-parser.service';
import { AdminController } from './controllers/admin/admin.controller';
import { RenderService } from './services/render/render.service';
import { WebsiteEditorGateway } from './gateways/website-editor.gateway';
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    //   renderPath: process.env?.adminPath,
    // }),
    MulterModule.register({
      dest: join(__dirname),
    }),
  ],
  controllers: [UploadController, WebsiteController, AdminController],
  providers: [
    DatabaseService,
    TemplateService,
    RenderService,
    AuthGateway,
    WebsiteEditorGateway,
    FileService,
    PageService,
    HtmlParserService,
  ],
})
export class AppModule {}
