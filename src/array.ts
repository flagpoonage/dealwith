import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared';
import {
  ArrayValidator,
  ValidatorFunction,
  ValidatorFunctionResultType,
} from './types';

const makeAssertion = makeAssertionBuilder('array');

const makeOfExactLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[]) => {
    makeAssertion(
      () => (negate ? v.length !== value : v.length === value),
      `of length ${v.length}`,
      `of exact length ${value}`,
      negate
    );
  };

const makeOfMinLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[]) => {
    makeAssertion(
      () => (negate ? v.length < value : v.length >= value),
      `of length ${v.length}`,
      `within minimum length of ${value}`,
      negate
    );
  };

const makeOfMaxLengthAssertion =
  (negate: boolean) => (value: number) => (v: unknown[]) => {
    makeAssertion(
      () => (negate ? v.length > value : v.length <= value),
      `of length ${v.length}`,
      `within maximum length of ${value}`,
      negate
    );
  };

const makeEmptyAssertion = (negate: boolean) => () => (v: unknown[]) => {
  makeAssertion(
    () => (negate ? v.length !== 0 : v.length === 0),
    `of length ${v.length}`,
    'empty',
    negate
  );
};

export function array<T = unknown>(
  generators: ((v: unknown) => unknown)[] = []
) {
  const assertions: ((v: T[]) => void)[] = [];

  const main = makePrimitiveValidator([], generators, (v) => {
    if (!Array.isArray(v)) {
      throw new Error(`Value ${v} is not an array`);
    }
  }) as ArrayValidator<T>;

  main.toString = valueToString(main, (v) => v.join(', '));
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);

  main.assert = (assertion: (v: T[]) => boolean, name?: string) => {
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
    assert: (assertion: (v: T[]) => boolean, name?: string) => {
      assertions.push(
        makeFunctionAssertion<T[]>(true, assertion, 'array', name)
      );
      return main;
    },
    empty: () => {
      assertions.push(makeEmptyAssertion(false)());
      return main;
    },
    ofExactLength: (value: number) => {
      assertions.push(makeOfExactLengthAssertion(false)(value));
      return main;
    },
  };

  main.items = function <K>(
    validator: ValidatorFunction<K>
  ): ArrayValidator<ValidatorFunctionResultType<ValidatorFunction<K>>> {
    return array<K>([
      (v: unknown) => {
        const result = main(v);
        if (result.hasError) {
          throw result.error.value;
        }

        const results = result.result.map(validator);

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
