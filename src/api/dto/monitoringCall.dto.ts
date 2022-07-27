import {  IsNotEmpty, IsArray } from 'class-validator';

export class MonitoringCallDTO  {
    @IsNotEmpty({message: "Поле numbers не может быть пустым. "})
    @IsArray({message: "Поле numbers должно быть массивом. "})
    numbers: Array<string>;

    description: string;
}

