import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = <ConfigService>app.get(ConfigService);
    const port = parseInt(configService.get('PORT'));

    app.enableCors();

    app.use(json({ limit: '10mb' }));

    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
        enableImplicitConversion: true,
        excludeExtraneousValues: true
    }));

    if (configService.get('NODE_ENV') !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('gerdan-app')
            .setVersion('0.0.1')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('swagger', app, document);
    }

    await app.listen(port);
}
bootstrap();
