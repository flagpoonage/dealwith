/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  KeyedError,
  ValidatorFunction,
  ValidatorFunctionResultType,
  ValueValidationResult,
} from './types';

// TODO: Get rid of this any!
export function oneof<T extends ((k: string, v: unknown) => any)[]>(
  ...validators: T
): ValidatorFunction<ValidatorFunctionResultType<T[number]>> {
  return (
    k: string,
    v: unknown
  ): ValueValidationResult<ValidatorFunctionResultType<T[number]>> => {
    const errors = [];
    for (const i of validators) {
      const c = i(k, v);
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
