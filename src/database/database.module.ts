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
        dialect: 'mariadb',
        host: configService.get('mariadb.host'),
        port: configService.get('mariadb.port'),
        username: configService.get('mariadb.username'),
        password: configService.get('mariadb.password'),
        database: configService.get('mariadb.databases'),
        autoLoadModels: true,
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
