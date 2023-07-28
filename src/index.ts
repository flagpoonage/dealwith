import { string } from './string.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { array } from './array.js';
import { object } from './object.js';
import { nullValue } from './null.js';
import { undefinedValue } from './undefined.js';
import { oneof } from './oneof.js';
import { optional } from './optional.js';
import { ValidatorFunction, ValueValidationResult } from './types.js';
import { stringUnion } from './string-union.js';
import { error } from './error.js';
import { record } from './record.js';

export const DW = {
  string,
  number,
  boolean,
  array,
  object,
  error,
  null: nullValue,
  undefined: undefinedValue,
  oneof,
  stringUnion,
  record,
  optional,
  anything:
    <T = unknown>(): ValidatorFunction<T> =>
    (v: unknown): ValueValidationResult<T> => ({
      initialValue: v,
      hasError: false,
      result: v as T,
    }),
};

export function makeTypeAssertion<T>(
  v: ValidatorFunction<T>
): (x: unknown) => x is T {
  return (x: unknown): x is T => {
    return !v(x).hasError;
  };
}

export * from './types.js';
export * from './flatten-error.js';
