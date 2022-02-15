import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AxiosModule } from '@app/axios/axios.module';
import { DatabaseModule } from '@app/database/database.module';
import { LoggerModule } from '@app/logger/logger.module';
import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [LoggerModule, AsteriskModule, DatabaseModule, AxiosModule],
    providers: [SocketGateway],
    exports:[SocketGateway]
})
export class SocketModule {}
