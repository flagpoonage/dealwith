import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
} from './converters';
import { makePrimitiveValidator, makeFunctionAssertion } from './shared';
import {
  ValidatorFunction,
  ValidatorFunctionResultType,
  ObjectValidator,
  ValueValidationResult,
} from './types';

export function object<T = unknown>(
  generators: ((v: unknown) => unknown)[] = []
) {
  const assertions: ((v: T) => void)[] = [];

  const main = makePrimitiveValidator([], generators, (v) => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      throw new Error(`Value ${v} is not an object`);
    }
  }) as ObjectValidator<T>;

  main.toString = valueToString(main, (v) => String(v));
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);

  const assert =
    (negate: boolean) => (assertion: (v: T) => boolean, name?: string) => {
      assertions.push(
        makeFunctionAssertion<T>(negate, assertion, 'object', name)
      );
      return main;
    };

  main.assert = assert(false);

  main.not = {
    assert: assert(true),
  };

  main.schema = function <T>(s: {
    [K in keyof T]: ValidatorFunction<T[K]>;
  }): ObjectValidator<ValidatorFunctionResultType<ValidatorFunction<T>>> {
    return object<T>([
      (v: unknown) => {
        const result = main(v);
        if (result.hasError) {
          throw result.error.value;
        }

        const obj = result.result as unknown as Record<keyof T, unknown>;

        const output = (
          Object.entries(s) as [keyof T, ValidatorFunction][]
        ).map<[keyof T, ValueValidationResult<unknown>]>(([key, validator]) => {
          return [key, validator(obj[key])];
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
