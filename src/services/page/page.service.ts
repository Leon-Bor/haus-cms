import { Injectable } from '@nestjs/common';
import { readdir, mkdir } from 'fs/promises';
import { join, resolve, basename } from 'path';

@Injectable()
export class PageService {
  pages = [];

  constructor() {
    this.init();
  }

  async init() {
    // create folder if not exists
    await mkdir(join(__dirname, '..', '..', 'website', 'pages'), {
      recursive: true,
    });
    await this.getPages();
  }

  async getPages() {
    this.pages = await readdir(join(__dirname, '..', '..', 'website', 'pages'));
    console.log(this.pages);
  }
}
