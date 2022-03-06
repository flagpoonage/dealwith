import { array } from './array';
import { boolean } from './boolean';
import { custom } from './custom';
import { number } from './number';
import { string } from './string';
import { KeyedError, ValidatorFunction } from './types';

export function valueToString<T>(
  previousValidator: ValidatorFunction<T>,
  def: (v: T) => string
) {
  return (fn: (v: T) => string = def) => {
    return string([
      (k: string, v: unknown) => {
        const result = previousValidator(k, v);
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
      (k: string, v: unknown) => {
        const result = previousValidator(k, v);
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
      (k: string, v: unknown) => {
        const result = previousValidator(k, v);
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
      (k: string, v: unknown) => {
        const result = previousValidator(k, v);
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
      (k: string, v: unknown) => {
        const result = previousValidator(k, v);
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
