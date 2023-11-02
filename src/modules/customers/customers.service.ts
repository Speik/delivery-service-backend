import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '../../entities/customer.entity';
import { Transaction } from 'src/shared';

type SaveCustomerPayload = Omit<
  Customer,
  'id' | 'createdAt' | 'updatedAt' | 'customerNumber' | 'orders'
>;

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  public search(term: string) {
    return this.customersRepository.query(`
      SELECT * FROM customers
      WHERE "customerNumber"::TEXT ILIKE '${parseInt(term)}%'
        OR name ILIKE '%${term}%'
        OR phone ILIKE '%${term}%'
      ORDER BY "createdAt" DESC;
    `) as Promise<Customer[]>;
  }

  public get(limit: number, offset: number) {
    return this.customersRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  public getById(id: string) {
    return this.customersRepository.findOne({ where: { id } });
  }

  public getByPhoneNumber(phone: string) {
    return this.customersRepository.findOne({ where: { phone } });
  }

  public async create(customer: SaveCustomerPayload, transaction: Transaction) {
    const existentCustomer = await this.getByPhoneNumber(customer.phone);

    if (!existentCustomer) {
      return transaction.manager.save(Customer, customer);
    }

    await transaction.manager.update(Customer, existentCustomer.id, customer);

    const updatedCustomer = await this.getByPhoneNumber(customer.phone);
    return updatedCustomer!;
  }
}
