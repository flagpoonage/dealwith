/* eslint-disable @typescript-eslint/no-explicit-any */
import { oneof } from './oneof.js';
import {
  ValidatorFunction,
  ValidatorFunctionResultType,
} from './types.js';
import { undefinedValue } from './undefined.js';

// TODO: Get rid of this any!
export function optional<T extends ((v: unknown, k?: string) => any)[]>(
  ...validators: T
): ValidatorFunction<ValidatorFunctionResultType<T[number]> | undefined> {
  return oneof(undefinedValue(), ...validators);
}
