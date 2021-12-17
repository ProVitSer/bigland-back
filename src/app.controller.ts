import { Body, Controller, Get, Req, Res, HttpStatus, Post, Redirect } from '@nestjs/common';
import { AmocrmService } from './amocrm/amocrm.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // constructor(private readonly amoService: AmocrmService) {}

  // @Get()
  // getHello(@Req() req, @Body() body, @Res() res): string {
  //   console.log(req)
  //   return res.status(HttpStatus.OK)
  // }

  // @Post()
  // post(@Req() req, @Body() body, @Res() res): string {
  //   console.log(req)
  //   return res.status(HttpStatus.OK)
  // }
  
  // @Get('auth')
  // auth(@Req() req, @Body() body, @Res() res) {
  //   //this.amoService.initAmocrm();
  // }
}
