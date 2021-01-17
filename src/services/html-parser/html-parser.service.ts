import { Injectable } from '@nestjs/common';
import { join, resolve, basename } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { load, html } from 'cheerio';
import { parseDocument } from 'htmlparser2';
import { DatabaseService } from '../database/database.service';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 24);

@Injectable()
export class HtmlParserService {
  editableTag = ['a', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'label', 'td', 'p'];

  constructor(private databaseService: DatabaseService) {}

  async removeNestedId(pageName = 'index.html') {
    const pagePath = join(__dirname, '..', '..', 'website', 'pages', pageName);
    const page = await readFile(pagePath, { encoding: 'utf-8' });
    const $ = load(page, { _useHtmlParser2: true });

    $('[data-haus-id]').each((i, element) => {
      if ($(element).parent().attr('data-haus-id')) {
        $(element).parent().removeAttr('data-haus-id');
      }
    });
    await writeFile(pagePath, $.html());
  }

  async removeNestedImg(pageName = 'index.html') {
    const pagePath = join(__dirname, '..', '..', 'website', 'pages', pageName);
    const page = await readFile(pagePath, { encoding: 'utf-8' });
    const $ = load(page, { _useHtmlParser2: true });

    $('[data-haus-img]').each((i, element) => {
      if ($(element).parent().attr('data-haus-id')) {
        $(element).parent().removeAttr('data-haus-id');
      }
    });
    await writeFile(pagePath, $.html());
  }

  async addIdAttribute(pageName = 'index.html') {
    const pagePath = join(__dirname, '..', '..', 'website', 'pages', pageName);
    const page = await readFile(pagePath, { encoding: 'utf-8' });
    const $ = load(page, { _useHtmlParser2: true });

    this.editableTag.map((tag) => {
      if (!$(tag).attr('data-haus-id') || $(tag).attr('data-haus-id') == '') {
        $(tag).each(async (i, e) => {
          let id = nanoid();
          $(e).attr('data-haus-id', id);
          this.databaseService.addInnerHtml(id, $(e).html());
        });
      }
    });

    await writeFile(pagePath, $.html());
    await this.removeNestedId(pageName);
  }

  async addImgAttribute(pageName = 'index.html') {
    const pagePath = join(__dirname, '..', '..', 'website', 'pages', pageName);
    const page = await readFile(pagePath, { encoding: 'utf-8' });
    const $ = load(page);

    if (!$('img').attr('data-haus-img') || $('img').attr('data-haus-img') == '') {
      $('img').each(async (i, e) => {
        let id = nanoid();
        $(e).attr('data-haus-img', id);
        this.databaseService.addImage(id, $(e).attr('src'));
      });
    }

    await writeFile(pagePath, $.html());
    await this.removeNestedImg(pageName);
  }
}
