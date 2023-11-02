import { DataSource, QueryRunner } from 'typeorm';

class Transaction {
  private readonly queryRunner: QueryRunner;

  public constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  public get manager() {
    return this.queryRunner.manager;
  }

  public async commit() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }

  public async rollback() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }
}

class TransactionFactory {
  public static async create(dataSource: DataSource) {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    return new Transaction(queryRunner);
  }
}

export { TransactionFactory, Transaction };
