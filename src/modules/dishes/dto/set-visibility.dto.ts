import { IsBoolean, IsDefined } from 'class-validator';

export class SetVisibilityDto {
  @IsBoolean()
  @IsDefined()
  public visible: boolean;
}
