import { compare } from 'bcrypt';

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { CreateManagerDto, LoginDto } from './dto';
import { ManagersService } from './managers.service';

import { Public } from '../../decorators/public.decorator';

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Public()
  @Post('login')
  public async login(@Body() payload: LoginDto) {
    const managerName = payload.name.trim();
    const isPersistent = payload.isPersistent ?? false;

    const manager = await this.managersService.getByName(managerName);
    if (!manager) throw new ForbiddenException('Invalid credentials');

    const isPasswordValid = await compare(payload.password, manager.password);
    if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');

    return this.managersService.login(manager, isPersistent);
  }

  @Get('search')
  public search(@Query('term') term: string) {
    const trimmedTerm = term.trim();

    return trimmedTerm.length >= 3
      ? this.managersService.search(trimmedTerm)
      : [];
  }

  @Get()
  public get(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.managersService.get(limit, offset);
  }

  @Post()
  public async create(@Body() payload: CreateManagerDto) {
    const manager = await this.managersService.getByName(payload.name);

    if (manager) {
      throw new BadRequestException('User with such name already exists');
    }

    return this.managersService.create(payload);
  }

  @Delete(':id')
  public async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const manager = await this.managersService.getById(id);

    if (!manager) {
      throw new NotFoundException('User not found');
    }

    return this.managersService.remove(id);
  }
}
