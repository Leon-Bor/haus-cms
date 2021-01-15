import { Injectable } from '@nestjs/common';
import * as low from 'lowdb';
import { IDatabase } from '../../models/interfaces/database.interface';
const FileAsync = require('lowdb/adapters/FileAsync');

@Injectable()
export class DatabaseService {
  adapter = null;
  db: low.LowdbAsync<IDatabase> = null;
  constructor() {
    this.adapter = new FileAsync('db.json');
    low(this.adapter).then((db) => {
      this.db = db;
      this.setDefaults();
    });
  }

  setDefaults(): void {
    // Set some defaults (required if your JSON file is empty)
    this.db
      .defaults({
        content: {
          images: {},
          innerHtml: {},
        },
        analytics: {},
        settings: {
          title: process.env?.title,
          adminToken: process.env?.adminToken,
          adminPath: process.env?.adminPath,
          domain: process.env?.enableAutoUpdates,
          enableAnalytics: !!process.env?.enableAnalytics,
          enableAutoUpdates: !!process.env?.enableAutoUpdates,
          editor: {},
        },
      })
      .write();
  }

  async getItem(item): Promise<any> {
    await this.db.read();
    return this.db.get(item);
  }
}
