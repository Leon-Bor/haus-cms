import { Injectable } from '@nestjs/common';
import { join, resolve, basename } from 'path';
import { rmdir, mkdir, readdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { HtmlParserService } from '../html-parser/html-parser.service';
import { DatabaseService } from '../database/database.service';

const slash = require('slash');

@Injectable()
export class FileService {
  files: string[] = null;
  indexFile: string = null;
  indexFilePath: string = null;

  constructor(private htmlParserService: HtmlParserService, private databaseService: DatabaseService) {}

  async getFilesRecursive(dir) {
    // from: https://stackoverflow.com/a/45130990/4337791
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFilesRecursive(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  async rmDir(dir, recursive = true) {
    await rmdir(dir, { recursive });
  }

  async createDir(dir: string, recursive = true, basename) {
    if (basename) {
      dir = dir.replace(basename, '');
    }

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive });
    }
  }

  async copyFile(from, to) {
    await this.createDir(to, true, basename(from));
    await copyFile(from, to);
  }

  copyTemplateToWebsite() {
    return new Promise(async (res, rej) => {
      try {
        // clear folders
        await this.rmDir(join(__dirname, '..', '..', 'website'));

        // template files
        this.files = await this.getFilesRecursive(join(__dirname, '..', '..', 'uploads', 'template'));
        this.indexFile = this.files.find((f: string) => f.endsWith('index.html'));
        this.indexFilePath = this.indexFile.replace('index.html', '');

        let pages = this.files.filter((f) => f.startsWith(this.indexFilePath) && f.endsWith('.html'));
        let assets = this.files.filter((f) => f.startsWith(this.indexFilePath) && !f.endsWith('.html'));

        // copy html files found next to index.html in template
        for (let index = 0; index < pages.length; index++) {
          await this.copyFile(pages[index], join(__dirname, '..', '..', 'website', 'pages', basename(pages[index])));
        }

        // copy assets (files) found next and under the index.html file
        for (let index = 0; index < assets.length; index++) {
          await this.copyFile(
            assets[index],
            join(
              __dirname,
              '..',
              '..',
              'website',
              'assets',
              ...slash(assets[index].replace(this.indexFilePath, '')).split('/'),
              basename(assets[index])
            )
          );
        }

        this.databaseService.clearContent();

        for (let index = 0; index < pages.length; index++) {
          await this.htmlParserService.addIdAttribute(basename(pages[index]));
          await this.htmlParserService.addImgAttribute(basename(pages[index]));
        }
      } catch (error) {
        rej(error);
      }
    });
  }
}
