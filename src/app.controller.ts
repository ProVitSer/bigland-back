import { Body, Controller, Get, Req, Res, HttpStatus, Post, Redirect } from '@nestjs/common';
import { AmocrmConnector } from './amocrm/amocrm.connect';
import { AmocrmService } from './amocrm/amocrm.service';
import { AppService } from './app.service';
import { AmiService } from './asterisk/asterisk-ami.service';

@Controller()
export class AppController {
  constructor(
    private readonly asterisk: AmiService,
    // private readonly amo: AmocrmConnector
    ) {}

  // @Get('amocrm')
  // async getHello(@Req() req, @Body() body, @Res() res) {
  //   //await this.asterisk.getDNDStatus('490');
  //   console.log('asdasdasd')
  //   return res.sendStatus(HttpStatus.OK)
  // }

  // @Post()
  // post(@Req() req, @Body() body, @Res() res): string {
  //   console.log(req)
  //   return res.status(HttpStatus.OK)
  // }
  
  // @Get('auth')
  // auth(@Req() req, @Body() body, @Res() res) {
  //   this.amo.amocrmAuth();
  // }
}
