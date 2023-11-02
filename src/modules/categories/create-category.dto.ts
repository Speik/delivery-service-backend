import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

const trimName = ({ value }: TransformFnParams) => {
  return value?.trim();
};

export class CreateCategoryDto {
  @Transform(trimName)
  @IsNotEmpty()
  @IsString()
  public name: string;
}
