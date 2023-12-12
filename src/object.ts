import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
} from './converters.js';
import { optional } from './optional.js';
import { makePrimitiveValidator, makeFunctionAssertion } from './shared.js';
import {
  ValidatorFunction,
  ValidatorFunctionResultType,
  ObjectValidator,
  ValueValidationResult,
  KeyedError,
} from './types.js';

export function object<T = unknown>(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: T, k?: string) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v, k = '') => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      throw new KeyedError(k, `Value ${v} is not an object`);
    }
  }) as ObjectValidator<T>;

  main.toString = valueToString(main, (v) => String(v));
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);

  const assert =
    (negate: boolean) => (assertion: (v: T) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<T>(negate, assertion, 'object', name)
      );
      return main;
    };

  main.assert = assert(false);

  main.not = {
    assert: assert(true),
  };

  main.schema = function <X>(s: {
    [K in keyof X]: ValidatorFunction<X[K]>;
  }): ObjectValidator<ValidatorFunctionResultType<ValidatorFunction<T & X>>> {
    return object<T & X>([
      (v: unknown, k = '') => {
        const result = main(v, k);

        if (result.hasError) {
          throw result.error;
        }

        const obj = { ...(v ?? {}), ...result.result } as unknown as Record<
          keyof T,
          unknown
        >;

        const output = (
          Object.entries(s) as [keyof T, ValidatorFunction][]
        ).map<[keyof T, ValueValidationResult<unknown>]>(([key, validator]) => {
          // Increase depth key here
          return [key, validator(obj[key], [k, key].filter(Boolean).join('.'))];
        });

        const errors = output.filter(([, r]) => r.hasError);

        if (errors.length > 0) {
          throw errors.reduce((acc, [key, result]) => {
            acc[key] = result;
            return acc;
          }, {} as Record<keyof T, ValueValidationResult<unknown>>);
        }

        return output.reduce<{ [K in keyof T]: T[K] }>((acc, [key, result]) => {
          if (!result.hasError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acc[key] = result.result as any;
          }

          return acc;
        }, {} as { [K in keyof T]: T[K] });
      },
    ]);
  };

  main.partial = function <X>(s: {
    [K in keyof X]: ValidatorFunction<X[K]>;
  }): ObjectValidator<
    ValidatorFunctionResultType<ValidatorFunction<T & Partial<X>>>
  > {
    return object<T & X>([
      (v: unknown, k = '') => {
        const result = main(v, k);

        if (result.hasError) {
          throw result.error;
        }

        const obj = { ...(v ?? {}), ...result.result } as unknown as Record<
          keyof T,
          unknown
        >;

        const output = (
          Object.entries(s) as [keyof T, ValidatorFunction][]
        ).map<[keyof T, ValueValidationResult<unknown>]>(([key, validator]) => {
          // Increase depth key here

          const r = optional(validator)(
            obj[key],
            [k, key].filter(Boolean).join('.')
          );

          if (r.hasError) {
            console.error('ERROR IS HERE', r.error);
          }

          return [key, r];
        });

        const errors = output.filter(([, r]) => r.hasError);

        if (errors.length > 0) {
          throw errors.reduce((acc, [key, result]) => {
            acc[key] = result;
            return acc;
          }, {} as Record<keyof T, ValueValidationResult<unknown>>);
        }

        return output.reduce<{ [K in keyof T]: T[K] }>((acc, [key, result]) => {
          if (!result.hasError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acc[key] = result.result as any;
          }

          return acc;
        }, {} as { [K in keyof T]: T[K] });
      },
    ]);
  };

  return main;
}
