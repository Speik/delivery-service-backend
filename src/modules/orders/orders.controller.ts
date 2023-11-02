import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Public } from '../../decorators/public.decorator';
import { ChangeStatusDto, CreateOrderDto } from './dto';
import { OrderStatus, OrderType } from '../../declarations';

import { OrdersService } from './orders.service';
import { DishesService } from '../dishes/dishes.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly dishesService: DishesService,
  ) {}

  @Get('search')
  public search(@Query('term') term: string) {
    return this.ordersService.search(term);
  }

  @Get()
  public get(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('onlyActive', ParseBoolPipe) isOnlyActive: boolean,
  ) {
    return this.ordersService.get(limit, offset, isOnlyActive);
  }

  @Public()
  @Post()
  public async create(@Body() payload: CreateOrderDto) {
    const uniqueDishesIds = [...new Set(payload.dishes)];
    const dishes = await this.dishesService.getById(uniqueDishesIds);

    if (dishes.length !== uniqueDishesIds.length) {
      throw new BadRequestException('Some dishes do not exist');
    }

    const isDishesValid = dishes.every(
      (dish) => !dish.deletedAt && dish.visible,
    );

    if (!isDishesValid) {
      throw new BadRequestException('Some dishes are not available to order');
    }

    const dishesPayload = payload.dishes.map((dishId) => {
      return dishes.find((dish) => dish.id === dishId)!;
    });

    const { name, phone, address, orderType, paymentMethod } = payload.customer;

    return this.ordersService.create({
      dishes: dishesPayload,
      type: orderType,
      paymentMethod: paymentMethod,
      comment: payload.comment ?? null,
      address: address ?? null,
      customer: {
        name: name,
        phone: phone,
        address: address ?? null,
        preferredPayment: paymentMethod,
        preferredOrder: orderType,
      },
    });
  }

  @Put('/status/:id')
  public async changeStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { status }: ChangeStatusDto,
  ) {
    const order = await this.ordersService.getById(id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const isDelivery = order.type === OrderType.DELIVERY;
    const isTakeaway = order.type === OrderType.TAKEAWAY;

    const isStatusWaiting = status === OrderStatus.WAITING;
    const isStatusDelivering = status === OrderStatus.DELIVERING;

    const isStatusValid =
      (isDelivery && !isStatusWaiting) || (isTakeaway && !isStatusDelivering);

    if (!isStatusValid) {
      throw new BadRequestException('Status is incompatible with this order');
    }

    return this.ordersService.changeStatus(order, status);
  }

  @Get('/count/active')
  public getActiveCount() {
    return this.ordersService.getActiveCount();
  }
}
