import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity({ name: 'managers' })
export class Manager extends BaseEntity {
  @Column({ unique: true, nullable: false })
  public name: string;

  @Column({ nullable: false })
  public password: string;
}
