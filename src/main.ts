import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import { join } from 'path';
import { cwd } from 'process';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './errors/http_exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = <ConfigService>app.get(ConfigService);
    const port = parseInt(configService.get('PORT'));

    app.enableCors();

    app.use(json({ limit: '10mb' }));

    app.useStaticAssets(join(cwd(), 'doc'));
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
        enableImplicitConversion: true,
        excludeExtraneousValues: true
    }));

    await app.listen(process.env.PORT || port);
}
bootstrap();
