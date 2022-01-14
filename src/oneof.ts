/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ValidatorFunction,
  ValidatorFunctionResultType,
  ValueValidationResult,
} from './types';

export function oneof<T extends ((v: unknown) => any)[]>(
  ...validators: T
): ValidatorFunction<ValidatorFunctionResultType<T[number]>> {
  return (
    v: unknown
  ): ValueValidationResult<ValidatorFunctionResultType<T[number]>> => {
    for (const i of validators) {
      const c = i(v);
      if (!c.hasError) {
        return c;
      }
    }

    return {
      initialValue: v,
      hasError: true,
      error: {
        isErrorInstance: true,
        value: new Error(`No validators were able to match ${v}`),
      },
    };
  };
}
