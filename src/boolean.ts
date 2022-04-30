import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
} from './converters.js';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared.js';
import { BooleanValidator, KeyedError } from './types.js';

const makeAssertion = makeAssertionBuilder('boolean');

const makeTrueAssertion =
  (negate: boolean) => () => (k: string, v: boolean) => {
    makeAssertion(k, () => (negate ? !v : v), v, 'true', negate);
  };

const makeFalseAssertion =
  (negate: boolean) => () => (k: string, v: boolean) => {
    makeAssertion(k, () => (negate ? v : !v), v, 'false', negate);
  };

export function boolean(
  generators: ((k: string, v: unknown) => unknown)[] = []
) {
  const assertions: ((k: string, v: boolean) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (k, v) => {
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
    return main;
  };

  main.false = () => {
    assertions.push(makeFalseAssertion(false)());
    return main;
  };

  main.not = {
    assert: assert(true),
    true: () => {
      assertions.push(makeTrueAssertion(true)());
      return main;
    },
    false: () => {
      assertions.push(makeFalseAssertion(true)());
      return main;
    },
  };

  return main;
}
