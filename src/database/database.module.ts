import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from '../logger/logger.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cdr } from './entities/Cdr';

@Module({
  imports: [
    LoggerModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('mysql.host'),
        port: configService.get('mysql.port'),
        username: configService.get('mysql.username'),
        password: configService.get('mysql.password'),
        database: configService.get('mysql.databases'),
        autoLoadModels: false,
        synchronize: false
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([Cdr])
  ],
  providers: [DatabaseService],
  exports:[DatabaseService]
})
export class DatabaseModule {}
