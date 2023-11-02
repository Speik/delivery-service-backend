import { Get, Controller, Query, ParseIntPipe, Param } from '@nestjs/common';

import { Public } from 'src/decorators/public.decorator';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  public get(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.customersService.get(limit, offset);
  }

  @Get('search')
  public search(@Query('term') term: string) {
    return this.customersService.search(term);
  }

  @Public()
  @Get(':phone')
  public getByPhone(@Param('phone') phone: string) {
    return this.customersService.getByPhoneNumber(phone);
  }
}
