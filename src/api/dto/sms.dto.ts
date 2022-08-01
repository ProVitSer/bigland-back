import { IsNotEmpty, IsString } from 'class-validator';

export class SMSDto  {
    @IsString()
    @IsNotEmpty({message: "Поле number не может быть пустым. "})
    number: string;

    @IsString()
    @IsNotEmpty({message: "Поле text  не может быть пустым. "})
    text: string;
}

