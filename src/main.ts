import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import configuration from '@app/config/config.provider';
import httpsConfig from './https.provider';


async function bootstrap() {
  const config = new ConfigService(configuration());
  const httpsOptions = httpsConfig(config);
  const app = await NestFactory.create(AppModule, {...(httpsOptions ? { httpsOptions } : {})});
  //app.setGlobalPrefix('v1')
  await app.listen(config.get('appPort'));
}
bootstrap();
