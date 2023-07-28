/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ValidatorFunction,
  ValidatorFunctionResultType,
  ValueValidationResult,
} from './types.js';

// TODO: Get rid of this any!
export function oneof<T extends ((v: unknown, k?: string) => any)[]>(
  ...validators: T
): ValidatorFunction<ValidatorFunctionResultType<T[number]>> {
  return (
    v: unknown,
    k = ''
  ): ValueValidationResult<ValidatorFunctionResultType<T[number]>> => {
    const errors = [];
    for (const i of validators) {
      const c = i(v, k);
      if (!c.hasError) {
        return c;
      }
      errors.push(c);
    }

    return {
      hasError: true,
      initialValue: v,
      error: errors,
    };

    // Perhaps the errors from each validator should get listed here
    // throw new KeyedError(k, `No validators were able to match ${v}`);
  };
}
