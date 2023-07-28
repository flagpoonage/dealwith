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

export const DW = {
  string,
  number,
  boolean,
  array,
  object,
  null: nullValue,
  undefined: undefinedValue,
  oneof,
  stringUnion,
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

type Q = {
  q: 'james';
};

type P = {
  p: 'james';
};

type R = Q | P;

type X = {
  name: 'test';
  value: Q | P;
};

object().schema<X>({
  name: string().equals('test'),
  value: oneof(
    object().schema<Q>({
      q: string().equals('james'),
    }),
    object().schema<P>({
      p: string().equals('james'),
    })
  ),
});

export * from './types.js';
export * from './flatten-error.js';
