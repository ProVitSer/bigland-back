import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: Error) {
        if(user == false){
            throw new HttpException({
                result: 'token_fail',
                message:'Некорректный token или истек срок его действия'}, 
                HttpStatus.UNAUTHORIZED);
        }
        return user
    }
}