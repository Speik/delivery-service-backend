import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { typeormConfig } from './typeorm.config';

import { ManagersModule } from './modules/managers/managers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DishesModule } from './modules/dishes/dishes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WebSocketsModule } from './modules/web-sockets/web-sockets.module';

const STATIC_DIRECTORY_NAME = 'static';

@Module({
  controllers: [AppController],
  imports: [
    MulterModule.register(),
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        typeormConfig,
        // Global variables
        () => ({
          STATIC_DIRECTORY_PATH: join(process.cwd(), STATIC_DIRECTORY_NAME),
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('typeorm') as TypeOrmModuleOptions;
      },
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const staticDirectoryPath = configService.get<string>(
          'STATIC_DIRECTORY_PATH',
        )!;

        return [{ rootPath: staticDirectoryPath }];
      },
    }),
    ManagersModule,
    CustomersModule,
    CategoriesModule,
    DishesModule,
    OrdersModule,
    DashboardModule,
    WebSocketsModule,
  ],
})
export class AppModule {}
