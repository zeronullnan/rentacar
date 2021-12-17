import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const swgConfig = new DocumentBuilder()
        .setTitle('"Rent a car" service')
        .setVersion('1.0')
        .build();

    const swgDocument = SwaggerModule.createDocument(app, swgConfig);
    SwaggerModule.setup('swagger', app, swgDocument);

    await app.listen(3000);
}

bootstrap();
