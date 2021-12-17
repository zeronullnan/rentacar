import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { KNEX_CONFIG } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [KnexModule.forRoot(KNEX_CONFIG)],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
