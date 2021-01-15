import { Controller, Get, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { diskStorage } from 'multer';

let env = dotenv.config().parsed;
@Controller(env?.adminPath)
export class UploadController {
  private logger: Logger = new Logger('UploadController');
  constructor() {
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
  uploadTemplate(@UploadedFile() file) {
    console.log(file);
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
      }),
    })
  )
  @Get('upload-file')
  uploadFile(@UploadedFile() file) {
    console.log(file);
  }
}
