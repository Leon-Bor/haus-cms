import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
  Response,
} from '@nestjs/common';
import { RenderService } from '../../services/render/render.service';
import { TemplateService } from '../../services/template/template.service';

@Controller()
export class WebsiteController {
  constructor(private renderService: RenderService) {}

  @Get('robots.txt')
  getRobots(@Response() res): string {
    try {
      res.type('text/plain');
      res.send(`User-Agent: * \n Sitemap: /sitemap.xml `);
    } catch {
      return this.renderService.render('error-404');
    }
  }

  @Get('sitemap.xml')
  getSitemap(@Param() params, @Query() query: any): string {
    try {
      // todo: return sitemap
      return `sitemap`;
    } catch {
      return this.renderService.render('error-404');
    }
  }

  @Get()
  getIndex(@Query() query: any, @Req() req): string {
    const { edit = false, language } = query;
    const { hausEdit } = req.cookies;
    try {
      console.log('get website');
      console.log();
      return this.renderService.renderPage('index', {
        edit: edit == 'true' || hausEdit == 'true',
        language,
      });
    } catch {
      return this.renderService.render('error-404');
    }
  }

  @Get(':page0/:page1?/:page2?/:page3?/:page4?')
  getPage(@Param() params, @Query() query: any, @Req() req): string {
    const { edit = false, language } = query;
    const { hausEdit } = req.cookies;
    const { page0, page1, page2, page3, page4 } = params;
    const path = `${page0.replace('index.html', 'index')}${
      page1 ? '/' + page1 : ''
    }${page2 ? '/' + page2 : ''}${page3 ? '/' + page3 : ''}${
      page4 ? '/' + page4 : ''
    }`;
    try {
      return this.renderService.renderPage(path, {
        edit: edit == 'true' || hausEdit == 'true',
        language,
      });
    } catch {
      return this.renderService.render('error-404');
    }
  }

  @Get('*')
  get404(): string {
    try {
      return this.renderService.render('error-404');
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Something definitely went wrong here.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
