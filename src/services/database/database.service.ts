import { Injectable } from '@nestjs/common';
import * as low from 'lowdb';
import { Settings } from '../../models/classes/settings.model';
import { IDatabase } from '../../models/interfaces/database.interface';
const FileSync = require('lowdb/adapters/FileSync');

@Injectable()
export class DatabaseService {
  db = null;

  constructor() {
    this.db = low(new FileSync('db.json'));
    this.setDefaults();
  }

  setDefaults(): void {
    // Set some defaults (required if your JSON file is empty)
    this.db
      .defaults({
        content: {
          image: {},
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
          enableI18n: false,
          i18nLanguages: [],
          defaultLanguage: 'de',
          editor: {},
        },
      })
      .write();
  }

  getItem(item): any {
    this.db.read();
    return this.db.get(item).value();
  }

  clearContent(): void {
    this.db.set(`content.innerHtml`, {}).write();
    this.db.set(`content.image`, {}).write();
  }

  addInnerHtml(id, html): void {
    const settings: Settings = this.getItem('settings');
    const defaultLanguage = settings?.defaultLanguage || 'de';
    this.db.read();
    this.db.set(`content.innerHtml.${id}`, { [defaultLanguage]: html }).write();
  }

  addImage(id, src): void {
    const settings: Settings = this.getItem('settings');
    const defaultLanguage = settings?.defaultLanguage || 'de';
    this.db.read();
    this.db.set(`content.image.${id}`, { src }).write();
  }
}
