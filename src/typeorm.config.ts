import 'dotenv/config';

import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const DATABASE_DIALECT = 'postgres';

const dbConfig = {
  type: DATABASE_DIALECT,
  host: `${process.env.DB_HOST}`,
  port: Number(`${process.env.DB_PORT}`),
  username: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASS}`,
  database: `${process.env.DB_NAME}`,
  synchronize: true,
  entities: ['dist/entities/*.entity{.js, .ts}'],
  migrations: ['dist/migrations/*{.js, .ts}'],
  migrationsTableName: 'typeorm_migrations',
};

export const connectionSource = new DataSource(dbConfig as DataSourceOptions);
export const typeormConfig = registerAs('typeorm', () => dbConfig);
