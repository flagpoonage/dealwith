import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared.js';
import {
  KeyedError,
  ArrayValidator,
  ValidatorFunction,
  ValidatorFunctionResultType,
} from './types.js';

const makeAssertion = makeAssertionBuilder('array');

const makeOfExactLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[], k = '') => {
    makeAssertion(
      k,
      () => (negate ? v.length !== value : v.length === value),
      `of length ${v.length}`,
      `of exact length ${value}`,
      negate
    );
  };

const makeOfMinLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[], k = '') => {
    makeAssertion(
      k,
      () => (negate ? v.length < value : v.length >= value),
      `of length ${v.length}`,
      `within minimum length of ${value}`,
      negate
    );
  };

const makeOfMaxLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[], k = '') => {
    makeAssertion(
      k,
      () => (negate ? v.length > value : v.length <= value),
      `of length ${v.length}`,
      `within maximum length of ${value}`,
      negate
    );
  };

const makeEmptyAssertion =
  (negate: boolean) => () => (v: unknown[], k = '') => {
    makeAssertion(
      k,
      () => (negate ? v.length !== 0 : v.length === 0),
      `of length ${v.length}`,
      'empty',
      negate
    );
  };

export function array<T = unknown>(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: T[], k?: string) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v, k='') => {
    if (!Array.isArray(v)) {
      throw new KeyedError(k, `Value ${v} is not an array`);
    }
  }) as ArrayValidator<T>;

  main.toString = valueToString(main, (v) => v.join(', '));
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);

  main.assert = (assertion: (v: T[]) => boolean, name: string) => {
    assertions.push(
      makeFunctionAssertion<T[]>(false, assertion, 'array', name)
    );
    return main;
  };

  main.ofExactLength = (value: number) => {
    assertions.push(makeOfExactLengthAssertion(false)(value));
    return main;
  };

  main.ofMinLength = (value: number) => {
    assertions.push(makeOfMinLengthAssertion(false)(value));
    return main;
  };

  main.ofMaxLength = (value: number) => {
    assertions.push(makeOfMaxLengthAssertion(false)(value));
    return main;
  };

  main.empty = () => {
    assertions.push(makeEmptyAssertion(false)());
    return main;
  };

  main.not = {
    assert: (assertion: (v: T[]) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<T[]>(true, assertion, 'array', name)
      );
      return main;
    },
    empty: () => {
      assertions.push(makeEmptyAssertion(true)());
      return main;
    },
    ofExactLength: (value: number) => {
      assertions.push(makeOfExactLengthAssertion(true)(value));
      return main;
    },
  };

  main.items = function <K>(
    validator: ValidatorFunction<K>
  ): ArrayValidator<ValidatorFunctionResultType<ValidatorFunction<K>>> {
    return array<K>([
      (v: unknown, k = '') => {
        const result = main(v, k);
        if (result.hasError) {
          throw result.error;
        }

        const results = result.result.map((v, i) =>
          // Increase key depth here
          validator(v, [k, `[${i}]`].filter(Boolean).join('.'))
        );

        if (results.some((a) => a.hasError)) {
          throw results.filter((a) => a.hasError);
        }

        return results.reduce((acc, v) => {
          if (!v.hasError) {
            acc.push(v.result);
          }

          return acc;
        }, [] as K[]);
      },
    ]);
  };

  return main;
}
