import {
  valueToArray,
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import { makeFunctionAssertion, makePrimitiveValidator } from './shared.js';
import { CustomValidator } from './types.js';

export function custom<C>(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const assertions: ((v: C, k?: string) => void)[] = [];

  const main = makePrimitiveValidator<C>(
    assertions,
    generators
  ) as CustomValidator<C>;

  main.toString = valueToString(main, () => '');
  main.toNumber = valueToNumber(main, () => 0);
  main.toBoolean = valueToBoolean(main, () => false);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  const assert =
    (negate: boolean) => (assertion: (v: C) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<C>(negate, assertion, 'custom value', name)
      );
      return main;
    };

  main.assert = assert(false);
  main.not = {
    assert: assert(true),
  };

  return main;
}
