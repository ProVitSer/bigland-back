import { apiStatusDND } from '@app/asterisk/types/interfaces';
import { IsEnum, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class DNDDto  {
    @IsNotEmpty({message: "Поле sip_id не может быть пустым. "})
    @IsArray({message: "Поле sip_id должно быть массивом. "})
    sip_id: Array<string>;

    @IsNotEmpty({message: "Поле dnd_status не может быть пустым, on/off. "})
    @IsEnum(apiStatusDND, {message: "Поле dnd_status должно быть одним из значений on/off. "} )
    dnd_status: apiStatusDND;
}

