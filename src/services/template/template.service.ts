import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

@Injectable()
export class TemplateService {
  njk = nunjucks.configure(path.join(__dirname, '..', '..', 'dist'), {
    autoescape: true,
    noCache: true,
    // using `watch: true` would block closing the application for the tests
  });

  render(name, data = {}) {
    return this.njk.render(`${name}.njk`, data);
  }
}
