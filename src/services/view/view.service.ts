import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

@Injectable()
export class ViewService {
  njk = nunjucks.configure(path.join(__dirname, '..', '..', 'views'), {
    autoescape: true,
    noCache: true,
    // using `watch: true` would block closing the application for the tests
  });

  constructor() {
    console.log(path.join(__dirname));
  }

  render(name, data = {}) {
    return this.njk.render(`${name}.njk`, data);
  }
}
