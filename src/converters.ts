import { array } from './array.js';
import { boolean, booleanFalse, booleanTrue } from './boolean.js';
import { custom } from './custom.js';
import { number } from './number.js';
import { stringUnion } from './string-union.js';
import { string } from './string.js';
import {
  BooleanFalseValidator,
  BooleanTrueValidator,
  BooleanValidator,
  KeyedError,
  StringValidator,
  ValidatorFunction,
} from './types.js';

export function valueToString<T>(
  previousValidator: ValidatorFunction<T>,
  def: (v: T) => string
) {
  return (fn: (v: T) => string = def) => {
    return string([
      (v: unknown, k = '') => {
        const result = previousValidator(v, k);
        if (result.hasError) {
          throw result.error;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new KeyedError(
            k,
            `Unable to create a string from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}

export function valueToNumber<T>(
  previousValidator: ValidatorFunction<T>,
  def: (v: T) => number
) {
  return (fn: (v: T) => number = def) => {
    return number([
      (v: unknown, k = '') => {
        const result = previousValidator(v, k);
        if (result.hasError) {
          throw result.error;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new KeyedError(
            k,
            `Unable to create a number from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}

export function valueToBoolean<T>(
  previousValidator: ValidatorFunction<T>,
  def: (v: T) => boolean
) {
  return (fn: (v: T) => boolean = def) => {
    return boolean([
      (v: unknown, k = '') => {
        const result = previousValidator(v, k);
        if (result.hasError) {
          throw result.error;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new KeyedError(
            k,
            `Unable to create a booolean from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}

export function valueToCustom<T>(previousValidator: ValidatorFunction<T>) {
  return <C>(fn: (v: T) => C) => {
    return custom<C>([
      (v: unknown, k = '') => {
        const result = previousValidator(v, k);
        if (result.hasError) {
          throw result.error;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new KeyedError(
            k,
            `Unable to create custom type from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}

export function valueToArray<T>(previousValidator: ValidatorFunction<T>) {
  return <K>(fn: (v: T) => K[]) => {
    return array<K>([
      (v: unknown, k = '') => {
        const result = previousValidator(v, k);
        if (result.hasError) {
          throw result.error;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new KeyedError(
            k,
            `Unable to create an array from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}

export function stringToStringUnion<T extends string[]>(
  previousValidator: StringValidator
) {
  return stringUnion<T>([
    (v: unknown, k = '') => {
      const result = previousValidator(v, k);
      if (result.hasError) {
        throw result.error;
      }

      return v as T[number];
    },
  ]);
}

type VType<T> = T extends true ? BooleanTrueValidator : BooleanFalseValidator;

export function booleanToBooleanExact<T extends boolean>(
  v: T,
  previousValidator: BooleanValidator
): VType<T> {
  const fn = v ? booleanTrue : booleanFalse;
  return fn([
    (v: unknown, k = '') => {
      const result = previousValidator(v, k);
      if (result.hasError) {
        throw result.error;
      }

      return v as boolean;
    },
  ]) as VType<T>;
}
