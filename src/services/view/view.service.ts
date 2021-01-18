import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ViewService {
  njk = nunjucks.configure(path.join(__dirname, '..', '..', 'views'), {
    autoescape: true,
    noCache: true,
    // using `watch: true` would block closing the application for the tests
  });

  constructor(private databaseService: DatabaseService) {}

  render(name, data = {}) {
    return this.njk.render(`${name}.njk`, {
      ...data,
    });
  }

  renderPage(name, data = {}) {
    return this.njk.render(`${name}.njk`, {
      ...data,
      language: 'de',
      image: this.databaseService.getItem('content.image'),
      innerHtml: this.databaseService.getItem('content.innerHtml'),
      settings: JSON.stringify(this.databaseService.getItem('settings')),
    });
  }
}
