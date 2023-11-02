import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'is-price', async: false })
export class IsPrice implements ValidatorConstraintInterface {
  validate(value: unknown) {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) return false;
    return parsedValue > 0;
  }

  defaultMessage() {
    return '($value) must be positive non-zero value';
  }
}
