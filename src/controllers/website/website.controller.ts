import { Controller, Get, HttpException, HttpStatus, Param, Query, Response } from '@nestjs/common';
import { TemplateService } from '../../services/template/template.service';
import { ViewService } from '../../services/view/view.service';

@Controller()
export class WebsiteController {
  constructor(private viewService: ViewService) {}

  @Get('robots.txt')
  getRobots(@Response() res): string {
    try {
      res.type('text/plain');
      res.send(`User-Agent: * \n Sitemap: /sitemap.xml `);
    } catch {
      return this.viewService.render('error-404');
    }
  }

  @Get('sitemap.xml')
  getSitemap(@Param() params, @Query() query: any): string {
    try {
      // todo: return sitemap
      return `sitemap`;
    } catch {
      return this.viewService.render('error-404');
    }
  }

  @Get()
  getIndex(@Query() query: any): string {
    const { edit = false, language } = query;
    try {
      console.log('get website');
      return this.viewService.renderPage('index', { edit: !!edit, language });
    } catch {
      return this.viewService.render('error-404');
    }
  }

  @Get(':page0/:page1?/:page2?/:page3?/:page4?')
  getPage(@Param() params, @Query() query: any): string {
    const { edit = false, language } = query;
    const { page0, page1, page2, page3, page4 } = params;
    const path = `${page0.replace('index.html', 'index')}${page1 ? '/' + page1 : ''}${page2 ? '/' + page2 : ''}${page3 ? '/' + page3 : ''}${
      page4 ? '/' + page4 : ''
    }`;
    try {
      return this.viewService.renderPage(path, { edit: !!edit, language });
    } catch {
      return this.viewService.render('error-404');
    }
  }

  @Get('*')
  get404(): string {
    try {
      return this.viewService.render('error-404');
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Something definitely went wrong here.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
