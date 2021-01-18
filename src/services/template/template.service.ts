import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { load, html } from 'cheerio';
import { readFile, writeFile } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TemplateService {
  constructor(private databaseService: DatabaseService) {}

  async createTemplate(pageName = 'index.html') {
    const pagePath = join(__dirname, '..', '..', 'website', 'pages', pageName);
    const page = await readFile(pagePath, { encoding: 'utf-8' });
    const templatePath = join(__dirname, '..', '..', 'views', pageName.replace('.html', '.njk'));
    const $ = load(page, { _useHtmlParser2: true });

    $('[data-haus-id]').each((i, element) => {
      $(element).html(`{{ innerHtml.${$(element).attr('data-haus-id')}[language] | safe }}`);
    });

    $('[data-haus-img]').each((i, element) => {
      $(element).attr('src', `{{ image.${$(element).attr('data-haus-img')}.src | safe }}`);
    });

    const templateEditorHtml = await readFile(join(__dirname, 'template-editor.html'));

    $('body').append(`
        {% if edit %}
        <script>window.hausSettings={{settings | safe}};</script>
        ${templateEditorHtml}
        {% endif %}  
    `);

    await writeFile(templatePath, $.html());
  }
}
