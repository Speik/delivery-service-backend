import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ILike, Repository } from 'typeorm';
import { hash } from 'bcrypt';

import { Manager } from '../../entities/manager.entity';
import { CreateManagerDto } from './dto';

type ManagerResponse = Omit<Manager, 'password'>;

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager) private managersRepository: Repository<Manager>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async login(manager: Manager, isPersistent: boolean) {
    const secret = this.configService.get<string>('JWT_SECRET');

    const defaultTtl = this.configService.get<string | number>('JWT_TTL');
    const persistentTtl = this.configService.get<string | number>(
      'PERSISTENT_JWT_TTL',
    );

    const jwtEncodePayload = { id: manager.id, name: manager.name };
    const jwt = await this.jwtService.signAsync(jwtEncodePayload, {
      expiresIn: isPersistent ? persistentTtl : defaultTtl,
      secret,
    });

    return {
      accessToken: jwt,
      ...jwtEncodePayload,
    };
  }

  public search(term: string): Promise<ManagerResponse[]> {
    return this.managersRepository.find({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      where: { name: ILike(`%${term}%`) },
      order: { createdAt: 'DESC' },
    });
  }

  public get(limit: number, offset: number): Promise<ManagerResponse[]> {
    return this.managersRepository.find({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  public getById(id: string) {
    return this.managersRepository.findOne({ where: { id } });
  }

  public getByName(name: string) {
    return this.managersRepository.findOne({ where: { name } });
  }

  public async create(data: CreateManagerDto) {
    const { name, password } = data;
    const passwordHash = await hash(password, 12);

    const { password: _, ...createdManager } =
      await this.managersRepository.save({
        password: passwordHash,
        name,
      });

    return createdManager as ManagerResponse;
  }

  public remove(id: string) {
    return this.managersRepository.delete({ id });
  }
}
