import { Injectable } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { join, resolve, basename } from 'path';

@Injectable()
export class PageService {
  pages = [];

  constructor() {
    this.getPages();
  }

  async getPages() {
    this.pages = await readdir(join(__dirname, '..', '..', 'website', 'pages'));
    console.log(this.pages);
  }
}
