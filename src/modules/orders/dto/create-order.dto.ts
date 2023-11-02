import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  MAX_ADDRESS_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_CUSTOMER_NAME_LENGTH,
  OrderType,
  PaymentMethod,
} from 'src/declarations';

const trimValue = ({ value }: TransformFnParams) => {
  return value?.trim();
};

const lowerCaseValue = ({ value }: TransformFnParams) => {
  return String(value).toLowerCase();
};

class CustomerValidator {
  @Transform(trimValue)
  @IsNotEmpty()
  @IsString()
  @MaxLength(MAX_CUSTOMER_NAME_LENGTH)
  public name: string;

  @Transform(trimValue)
  @IsNotEmpty()
  @IsNumberString()
  public phone: string;

  @Transform(lowerCaseValue)
  @IsEnum(PaymentMethod)
  public paymentMethod: PaymentMethod;

  @Transform(lowerCaseValue)
  @IsEnum(OrderType)
  public orderType: OrderType;

  @ValidateIf((customer) => customer.orderType === OrderType.DELIVERY)
  @Transform(trimValue)
  @IsNotEmpty()
  @MaxLength(MAX_ADDRESS_LENGTH)
  public address?: string;
}

export class CreateOrderDto {
  @IsObject()
  @Type(() => CustomerValidator)
  @ValidateNested()
  public customer: CustomerValidator;

  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  public dishes: string[];

  @Transform(trimValue)
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(MAX_COMMENT_LENGTH)
  public comment?: string;
}
