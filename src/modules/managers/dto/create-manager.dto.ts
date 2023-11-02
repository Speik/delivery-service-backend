import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const parseName = ({ value }: TransformFnParams) => {
  return value?.replaceAll(' ', '');
};

export class CreateManagerDto {
  @Transform(parseName)
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  @IsString()
  public name: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  public password: string;
}
