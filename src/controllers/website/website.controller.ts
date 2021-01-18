import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { TemplateService } from '../../services/template/template.service';
import { ViewService } from '../../services/view/view.service';

@Controller()
export class WebsiteController {
  constructor(private viewService: ViewService) {}

  @Get()
  getIndex(@Query() query: any): string {
    const { edit = false } = query;
    try {
      console.log('get website');
      return this.viewService.renderPage('index', { edit: !!edit });
    } catch {
      return this.viewService.render('error-404');
    }
  }

  // @Get(':name')
  // getPage(@Param() params): string {
  //   const { name = 'index' } = params;
  //   try {
  //     return this.viewService.render(name);
  //   } catch {
  //     return this.viewService.render('error-404');
  //   }
  // }
  // @Get('*')
  // get404(): string {
  //   try {
  //     return this.viewService.render('error-404');
  //   } catch {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: 'Something definitely went wrong here.',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
}
