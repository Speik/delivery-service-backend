import { IsEnum } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

import { OrderStatus } from '../../../declarations';

const lowerCaseValue = ({ value }: TransformFnParams) => {
  return String(value).toLowerCase();
};

export class ChangeStatusDto {
  @Transform(lowerCaseValue)
  @IsEnum(OrderStatus)
  public status: OrderStatus;
}
