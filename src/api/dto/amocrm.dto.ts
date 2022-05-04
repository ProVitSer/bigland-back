import { IsEnum, IsNotEmpty, IsArray, IsString} from 'class-validator';

export class AmocrmDto  {
    @IsString()
    @IsNotEmpty({message: "Поле sip_id не может быть пустым. "})
    _login: string

    @IsString()
    @IsNotEmpty({message: "Поле sip_id не может быть пустым. "})
    _secret: string

    @IsString()
    _action: AmocrmActionStatus

    @IsString()
    rand: string

    @IsString()
    from: string

    @IsString()
    to: string

    @IsString()
    as: string
}

export enum AmocrmActionStatus {
    status = "status",
    call = "call",
    cdr = "cdr"
}
