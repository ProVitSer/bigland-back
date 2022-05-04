import { apiStatusDND } from '@app/asterisk/types/interfaces';
import { IsEnum, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class SMSDto  {
    @IsNotEmpty({message: "Поле mobile_number не может быть пустым. "})
    number: string;

    @IsNotEmpty({message: "text dnd_status не может быть пустым, on/off. "})
    text: string;
}

