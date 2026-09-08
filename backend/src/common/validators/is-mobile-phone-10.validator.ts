import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { isValidMobile } from '../utils/phone-validation.util';

export function IsMobilePhone10(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMobilePhone10',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') return true;
          return typeof value === 'string' && isValidMobile(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid 10-digit mobile number starting with 6-9 (e.g., 9876543210) and cannot be a dummy number like 0000000000`;
        },
      },
    });
  };
}
