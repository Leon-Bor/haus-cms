import { Injectable } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { join, resolve, basename } from 'path';

@Injectable()
export class ComponentsService {
  components = [];

  constructor() {
    this.getComponents();
  }

  async getComponents() {
    this.components = await readdir(join(__dirname, '..', '..', 'website', 'components'));
    console.log(this.components);
  }
}
