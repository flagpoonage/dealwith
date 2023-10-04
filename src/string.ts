import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
  stringToStringUnion,
} from './converters.js';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared.js';
import { KeyedError, StringValidator } from './types.js';

const makeAssertion = makeAssertionBuilder('string');

const makeEqualsAssertion =
  (negate: boolean, sensitive: boolean) =>
  (eq: string) =>
  (v: string, k = '') => {
    makeAssertion(
      k,
      () => {
        const casedValue = sensitive ? eq : eq.toLowerCase();
        const casedInput = sensitive ? v : v.toLowerCase();
        return negate ? casedInput !== casedValue : casedInput === casedValue;
      },
      v,
      'equal to',
      negate
    );
  };

const makeAllowedAssertion =
  (negate: boolean, sensitive: boolean) =>
  (values: string[]) =>
  (v: string, k = '') => {
    const casedValues = sensitive ? values : values.map((a) => a.toLowerCase());
    const casedInput = sensitive ? v : v.toLowerCase();
    const result = negate
      ? casedValues.indexOf(casedInput) === -1
      : casedValues.indexOf(casedInput) !== -1;

    if (!result) {
      throw new KeyedError(
        k,
        `String value ${v} ${
          negate
            ? `is one of the disallowed values in [${values.join(', ')}]`
            : `is not one of the allowed values in [${values.join(', ')}]`
        }`
      );
    }
  };

const makeEmptyAssertion =
  (negate: boolean) =>
  () =>
  (v: string, k = '') => {
    makeAssertion(
      k,
      () => (negate ? v.length !== 0 : v.length === 0),
      v,
      'empty',
      negate
    );
  };

const makeMatchesAssertion =
  (negate: boolean) =>
  (regex: RegExp) =>
  (v: string, k = '') => {
    const result = negate ? !regex.test(v) : regex.test(v);

    if (!result) {
      throw new KeyedError(
        k,
        `String value '${v}' ${
          negate ? 'matches' : 'does not match'
        } pattern ${regex}`
      );
    }
  };

export function string(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: string, k?: string) => void)[] = [];
  const sensitivity = { enabled: true };

  const main = makePrimitiveValidator(assertions, generators, (v, k = '') => {
    if (typeof v !== 'string') {
      throw new KeyedError(k, `Value ${v} is not a string`);
    }
  }) as StringValidator;

  main.toString = valueToString(main, (v) => v);
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  const assert =
    (negate: boolean) => (assertion: (v: string) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<string>(negate, assertion, 'string', name)
      );
      return main;
    };

  main.assert = assert(false);

  main.allowed = <T extends string>(...values: T[]) => {
    assertions.push(makeAllowedAssertion(false, sensitivity.enabled)(values));
    return stringToStringUnion<T[]>(main);
  };

  main.matches = (r: RegExp) => {
    assertions.push(makeMatchesAssertion(false)(r));
    return main;
  };

  main.empty = () => {
    assertions.push(makeEmptyAssertion(false)());
    return main;
  };

  main.equals = <T extends string>(value: T) => {
    assertions.push(makeEqualsAssertion(false, sensitivity.enabled)(value));
    return stringToStringUnion<[T]>(main);
  };
  // stringToStringUnion<[T]>(main)((v) => v === value);

  // main.equals = (eq: string) => {
  //   assertions.push(makeEqualsAssertion(false, sensitivity.enabled)(eq));
  //   return main;
  // };

  main.case = (v: 'sensitive' | 'insensitive') => {
    sensitivity.enabled = v === 'sensitive';
    return main;
  };

  main.not = {
    assert: assert(true),
    allowed: (...values: string[]) => {
      assertions.push(makeAllowedAssertion(true, sensitivity.enabled)(values));
      return main;
    },

    matches: (r: RegExp) => {
      assertions.push(makeMatchesAssertion(true)(r));
      return main;
    },

    empty: () => {
      assertions.push(makeEmptyAssertion(true)());
      return main;
    },

    equals: (eq: string) => {
      assertions.push(makeEqualsAssertion(true, sensitivity.enabled)(eq));
      return main;
    },
  };

  return main;
}
