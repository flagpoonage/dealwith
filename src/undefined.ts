import {
  valueToArray,
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters';
import { makePrimitiveValidator } from './shared';
import { UndefinedValidator } from './types';

export function undefinedValue(generators: ((v: unknown) => unknown)[] = []) {
  const main = makePrimitiveValidator([], generators, (v) => {
    if (v !== undefined) {
      throw new Error(`Value ${v} is not undefined`);
    }
  }) as UndefinedValidator;

  main.toString = valueToString(main, () => String(undefined));
  main.toNumber = valueToNumber(main, () => Number(undefined));
  main.toBoolean = valueToBoolean(main, () => Boolean(undefined));
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  return main;
}
