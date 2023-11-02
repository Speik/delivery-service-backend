import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

import { IsPrice } from 'src/validators/is-price.validator';

const trimValue = ({ value }: TransformFnParams) => {
  return value?.trim();
};

const parsePrice = ({ value }: TransformFnParams) => {
  return Number(value);
};

export class UpdateDishDto {
  @Transform(trimValue)
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public name?: string;

  @Transform(parsePrice)
  @IsOptional()
  @Validate(IsPrice)
  public price?: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public categoryId?: string;

  @Transform(trimValue)
  @IsString()
  @IsOptional()
  public description?: string;
}
