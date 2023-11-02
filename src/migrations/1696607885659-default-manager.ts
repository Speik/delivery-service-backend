import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcrypt';

import { Manager } from 'src/entities/manager.entity';
import { AppModule } from 'src/app.module';

export class DefaultManager1696607885659 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const managersRepository =
      queryRunner.connection.getRepository<Manager>(Manager);

    const ctx = await NestFactory.createApplicationContext(AppModule);
    const configService = ctx.get(ConfigService);

    const name = configService.get<string>('DEFAULT_MANAGER_NAME');
    const password = configService.get<string>('DEFAULT_MANAGER_PASSWORD');

    if (!name) {
      throw new Error('DEFAULT_MANAGER_NAME is not specified');
    }

    if (!password) {
      throw new Error('DEFAULT_MANAGER_PASSWORD is not specified');
    }

    const parsedName = name.replaceAll(' ', '');
    const passwordHash = await hash(password, 12);

    await managersRepository.save({
      name: parsedName,
      password: passwordHash,
    });

    await ctx.close();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const managersRepository =
      queryRunner.connection.getRepository<Manager>(Manager);

    const ctx = await NestFactory.createApplicationContext(AppModule);
    const configService = ctx.get(ConfigService);

    const name = configService.get<string>('DEFAULT_MANAGER_NAME');

    if (!name) {
      throw new Error('DEFAULT_MANAGER_NAME is not specified');
    }

    const parsedName = name.replaceAll(' ', '');

    await managersRepository.delete({
      name: parsedName,
    });

    await ctx.close();
  }
}
