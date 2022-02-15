import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AuthService } from '@app/auth/auth.service';
import { JwtAuthGuard } from '@app/auth/jwt-auth.guard';
import { HttpExceptionFilter } from '@app/exceptions/http-exception.filter';
import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { DNDDto } from './dto/dnd.dto';

@Controller()
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ApiController {
    constructor(
        private readonly ami: AmiService,
        private readonly auth: AuthService

    ){}

    @Post('dnd')
    async getHello(@Req() req, @Body() body: DNDDto, @Res() res) {
      try {
        const resultSet = await this.ami.setDNDStatus(body);        
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

    // @Get('login')
    // async getAuth(@Req() req, @Res() res) {
    //   const token = await this.auth.signToken()
    //   console.log(token)
    // }
}
