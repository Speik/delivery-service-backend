import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseUTCDatePipe implements PipeTransform<string, Date> {
  public transform(value: string, metadata: ArgumentMetadata): Date {
    const valueName = metadata.data;
    const parsedTimestamp = Number(value);

    if (!value || isNaN(parsedTimestamp)) {
      throw new BadRequestException(`${valueName} must be a valid timestamp`);
    }

    return new Date(parsedTimestamp);
  }
}
