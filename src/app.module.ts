import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import models from 'src/database/models';
import { AuthModule } from './auth/auth.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { BucketModule } from './routes/bucket/bucket.module';
import { GerdansModule } from './routes/gerdans/gerdans.module';
import { UsersModule } from './routes/users/users.module';
import { getSequelizeConfiguration } from './utils/sequelize_config';

const sequelizeLogger = new Logger('Sequelize');

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SequelizeModule.forRoot({
            ...getSequelizeConfiguration(),
            models,
            benchmark: true,
            logging: (message, time) => sequelizeLogger.log(`(${time}ms) ${message}`)
        }),
        HealthcheckModule,
        AuthModule,
        GerdansModule,
        UsersModule,
        BucketModule,
    ],
})
export class AppModule { }
