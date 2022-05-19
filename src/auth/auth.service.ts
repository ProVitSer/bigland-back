import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type JwtPayload = {
    login: string;
    password: string;
};

export type Tokens = {
    token: string;
};


@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    public async signToken(login: string, password: string): Promise<Tokens> {
        const payload: JwtPayload = { 
            login: login,
            password: password,
        };
        
        return {
            token: await this.jwtService.signAsync(payload,{ secret: this.configService.get('auth.tokenSecretKey'), algorithm:this.configService.get('auth.algorithm') } ),
        }
      }
    
    public async varifyToken(token: string){
        try {
            return await this.jwtService.verify(token, this.configService.get('auth.tokenSecretKey'));
          } catch(err) {
            throw err;
          }
    }

}
