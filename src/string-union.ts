import { valueToCustom } from './converters.js';
import { makeFunctionAssertion, makePrimitiveValidator } from './shared.js';
import { StringUnionValidator } from './types.js';

export function stringUnion<T extends string[]>(
  generators: ((v: unknown, k?: string) => unknown)[] = []
): StringUnionValidator<T> {
  const assertions: ((v: T, k?: string) => void)[] = [];

  const main = makePrimitiveValidator<T>(
    assertions,
    generators
  ) as StringUnionValidator<T>;

  main.toCustom = valueToCustom(main);

  const assert =
    (negate: boolean) => (assertion: (v: T) => boolean, name: string) => {
      assertions.push(
        makeFunctionAssertion<T>(negate, assertion, 'custom value', name)
      );
      return main;
    };

  main.assert = assert(false);
  main.not = {
    assert: assert(true),
  };

  return main;
}
