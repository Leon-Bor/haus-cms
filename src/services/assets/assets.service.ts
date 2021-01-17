import { Injectable } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { join, resolve, basename } from 'path';

@Injectable()
export class AssetsService {
  assets = [];

  constructor() {
    this.getAssets();
  }

  async getAssets() {
    this.assets = await readdir(join(__dirname, '..', '..', 'website', 'components'));
    console.log(this.assets);
  }
}
