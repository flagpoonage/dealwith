import { array } from './array';
import { boolean } from './boolean';
import { custom } from './custom';
import { number } from './number';
import { string } from './string';
import { ValidatorFunction } from './types';

export function valueToString<T>(
  previousValidator: ValidatorFunction<T>,
  def: (v: T) => string
) {
  return (fn: (v: T) => string = def) => {
    return string([
      (v: unknown) => {
        const result = previousValidator(v);
        if (result.hasError) {
          throw result.error.value;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new Error(
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
      (v: unknown) => {
        const result = previousValidator(v);
        if (result.hasError) {
          throw result.error.value;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new Error(
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
      (v: unknown) => {
        const result = previousValidator(v);
        if (result.hasError) {
          throw result.error.value;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new Error(
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
      (v: unknown) => {
        const result = previousValidator(v);
        if (result.hasError) {
          throw result.error.value;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new Error(
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
      (v: unknown) => {
        const result = previousValidator(v);
        if (result.hasError) {
          throw result.error.value;
        }

        try {
          return fn(result.result);
        } catch (exception) {
          throw new Error(
            `Unable to create an array from ${typeof result.result} ${
              result.result
            }\n\n ${exception instanceof Error ? exception.message : exception}`
          );
        }
      },
    ]);
  };
}
