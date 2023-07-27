import {
  valueToArray,
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import { makePrimitiveValidator } from './shared.js';
import { KeyedError, UndefinedValidator } from './types.js';

export function undefinedValue(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const main = makePrimitiveValidator([], generators, (v, k = '') => {
    if (v !== undefined) {
      throw new KeyedError(k, `Value ${v} is not undefined`);
    }
  }) as UndefinedValidator;

  main.toString = valueToString(main, () => String(undefined));
  main.toNumber = valueToNumber(main, () => Number(undefined));
  main.toBoolean = valueToBoolean(main, () => Boolean(undefined));
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  return main;
}
