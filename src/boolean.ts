import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
  booleanToBooleanExact,
} from './converters.js';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared.js';
import {
  BooleanFalseValidator,
  BooleanTrueValidator,
  BooleanValidator,
  KeyedError,
} from './types.js';

const makeAssertion = makeAssertionBuilder('boolean');

const makeTrueAssertion =
  (negate: boolean) =>
  () =>
  (v: boolean, k = '') => {
    makeAssertion(k, () => (negate ? !v : v), v, 'true', negate);
  };

const makeFalseAssertion =
  (negate: boolean) =>
  () =>
  (v: boolean, k = '') => {
    makeAssertion(k, () => (negate ? v : !v), v, 'false', negate);
  };

export function boolean(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: boolean, k?: string) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v, k = '') => {
    if (typeof v !== 'boolean') {
      throw new KeyedError(k, `Value ${v} is not a boolean`);
    }
  }) as BooleanValidator;

  main.toString = valueToString(main, (v) => v.toString());
  main.toNumber = valueToNumber(main, (v) => (v ? 1 : 0));
  main.toBoolean = valueToBoolean(main, (v) => v);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  const assert =
    (negate: boolean) => (assertion: (v: boolean) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<boolean>(negate, assertion, 'boolean', name)
      );
      return main;
    };

  main.assert = assert(false);

  main.true = () => {
    assertions.push(makeTrueAssertion(false)());
    return booleanToBooleanExact(true, main);
  };

  main.false = () => {
    assertions.push(makeFalseAssertion(false)());
    return booleanToBooleanExact(false, main);
  };

  main.not = {
    assert: assert(true),
    true: () => {
      assertions.push(makeTrueAssertion(true)());
      return booleanToBooleanExact(false, main);
    },
    false: () => {
      assertions.push(makeFalseAssertion(true)());
      return booleanToBooleanExact(true, main);
    },
  };

  return main;
}

export function booleanFalse(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: boolean, k?: string) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v, k = '') => {
    if (typeof v !== 'boolean') {
      throw new KeyedError(k, `Value ${v} is not a boolean`);
    } else if (v !== false) {
      throw new KeyedError(k, `Value ${v} must be false`);
    }
  }) as BooleanFalseValidator;

  main.toString = valueToString(main, (v) => v.toString());
  main.toNumber = valueToNumber(main, (v) => (v ? 1 : 0));
  main.toBoolean = valueToBoolean(main, (v) => v);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  return main;
}

export function booleanTrue(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: boolean, k?: string) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v, k = '') => {
    if (typeof v !== 'boolean') {
      throw new KeyedError(k, `Value ${v} is not a boolean`);
    } else if (v !== true) {
      throw new KeyedError(k, `Value ${v} must be true`);
    }
  }) as BooleanTrueValidator;

  main.toString = valueToString(main, (v) => v.toString());
  main.toNumber = valueToNumber(main, (v) => (v ? 1 : 0));
  main.toBoolean = valueToBoolean(main, (v) => v);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  return main;
}
