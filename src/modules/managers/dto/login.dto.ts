import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsString()
  public password: string;

  @IsOptional()
  @IsBoolean()
  public isPersistent?: boolean;
}
