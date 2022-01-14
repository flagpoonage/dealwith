import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters';
import { makePrimitiveValidator } from './shared';
import { NullValidator } from './types';

export function nullValue(generators: ((v: unknown) => unknown)[] = []) {
  const main = makePrimitiveValidator([], generators, (v) => {
    if (v !== null) {
      throw new Error(`Value ${v} is not null`);
    }
  }) as NullValidator;

  main.toString = valueToString(main, () => String(null));
  main.toNumber = valueToNumber(main, () => Number(null));
  main.toBoolean = valueToBoolean(main, () => Boolean(null));
  main.toCustom = valueToCustom(main);

  return main;
}
