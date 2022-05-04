import { JwtAuthGuard } from '@app/auth/jwt-auth.guard';
import { HttpExceptionFilter } from '@app/exceptions/http-exception.filter';
import { LoggerService } from '@app/logger/logger.service';
import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config';
import { ApiService } from './api.service';
import { AmocrmDto } from './dto/amocrm.dto';
import { DNDDto } from './dto/dnd.dto';
import { SMSDto } from './dto/sms.dto';

@Controller()
export class ApiController {
    constructor(
        private readonly log: LoggerService,
        private readonly config: ConfigService,
        private readonly apiService: ApiService,


    ){}

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('dnd')
    async getHello(@Req() req: Request, @Body() body: DNDDto, @Res() res: Response) {
      try {
        const resultSet = await this.apiService.setDndStatus(body);        
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: [resultSet],
          timestamp: new Date().toISOString(),
          createdBy: 'VoIPAPI',
        })
      } catch(e){
        return res.status(HttpStatus.FORBIDDEN).json({
          status: HttpStatus.FORBIDDEN,
          message: e,
          timestamp: new Date().toISOString(),
          createdBy: 'VoIPAPI',
        })
      }
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('sms')
    async sendSms(@Req() req: Request, @Body() body: SMSDto, @Res() res: Response) {
      try {
        const resultSend = await this.apiService.sendSms(body);        
        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: resultSend,
          timestamp: new Date().toISOString(),
          createdBy: 'VoIPAPI',
        })
      } catch(e){
        return res.status(HttpStatus.FORBIDDEN).json({
          status: HttpStatus.FORBIDDEN,
          message: e,
          timestamp: new Date().toISOString(),
          createdBy: 'VoIPAPI',
        })
      }
      
    }

    // @Get('login')
    // async getAuth(@Req() req, @Res() res) {
    //   const token = await this.auth.signToken()
    //   console.log(token)
    // }

    @Get('amocrm*')
    async amocrmGet(@Req() req: Request, @Res() res: Response, @Query() query: AmocrmDto) {
      if (query._login == this.config.get("amocrm.widget.login") && query._secret == this.config.get("amocrm.widget.secret")){
        try {
          const result = await this.apiService.amocrmWidget(query);
          return res.status(HttpStatus.OK).send(result)
        } catch(e){
          this.log.error(e)
          return res.status(HttpStatus.SERVICE_UNAVAILABLE).send(e);
        }
      }
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({});
    }

}
