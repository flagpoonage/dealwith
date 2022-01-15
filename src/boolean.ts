import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
} from './converters';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared';
import { BooleanValidator } from './types';

const makeAssertion = makeAssertionBuilder('boolean');

const makeTrueAssertion = (negate: boolean) => () => (v: boolean) => {
  makeAssertion(() => (negate ? !v : v), v, 'true', negate);
};

const makeFalseAssertion = (negate: boolean) => () => (v: boolean) => {
  makeAssertion(() => (negate ? v : !v), v, 'false', negate);
};

export function boolean(generators: ((v: unknown) => unknown)[] = []) {
  const assertions: ((v: boolean) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v) => {
    if (typeof v !== 'boolean') {
      throw new Error(`Value ${v} is not an array`);
    }
  }) as BooleanValidator;

  main.toString = valueToString(main, (v) => v.toString());
  main.toNumber = valueToNumber(main, (v) => (v ? 1 : 0));
  main.toBoolean = valueToBoolean(main, (v) => v);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  const assert =
    (negate: boolean) =>
    (assertion: (v: boolean) => boolean, name?: string) => {
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
      assertions.push(makeTrueAssertion(false)());
      return main;
    },
    false: () => {
      assertions.push(makeFalseAssertion(false)());
      return main;
    },
  };

  return main;
}
