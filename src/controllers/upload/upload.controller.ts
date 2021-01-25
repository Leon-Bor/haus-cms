import { Controller, Get, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import { FileService } from '../../services/file/file.service';
import { rmdir, mkdir, readdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';

let env = dotenv.config().parsed;
@Controller(env?.adminPath)
export class UploadController {
  private logger: Logger = new Logger('UploadController');
  constructor(private fileService: FileService) {
    this.logger.log('test');
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (req, file, cb) => {
          cb(null, 'template.zip');
        },
      }),
      fileFilter: function (req, file, cb) {
        console.log(file.mimetype);
        if (file.mimetype !== 'application/zip') {
          return cb(new Error('Wrong on the mimetype'), false);
        }
        cb(null, true);
      },
    })
  )
  @Post('upload-template')
  async uploadTemplate(@UploadedFile() file) {
    console.log('upload-template');
    try {
      if (existsSync(join(__dirname, '..', '..', 'uploads', 'template'))) {
        await rmdir(join(__dirname, '..', '..', 'uploads', 'template'), { recursive: true });
      }

      const stream = createReadStream(join(__dirname, '..', '..', 'uploads', 'template.zip')).pipe(
        unzipper.Extract({ path: join(__dirname, '..', '..', 'uploads', 'template') })
      );

      stream.on('finish', async () => {
        await this.fileService.copyTemplateToWebsite();
      });
    } catch (error) {
      console.log(error);
    }
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
      }),
    })
  )
  @Get('upload-file')
  async uploadFile(@UploadedFile() file) {
    console.log(file);
  }
}
