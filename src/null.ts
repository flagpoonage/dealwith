import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import { makePrimitiveValidator } from './shared.js';
import { KeyedError, NullValidator } from './types.js';

export function nullValue(
  generators: ((v: unknown, k?: string) => unknown)[] = []
) {
  const main = makePrimitiveValidator([], generators, (v, k = '') => {
    if (v !== null) {
      throw new KeyedError(k, `Value ${v} is not null`);
    }
  }) as NullValidator;

  main.toString = valueToString(main, () => String(null));
  main.toNumber = valueToNumber(main, () => Number(null));
  main.toBoolean = valueToBoolean(main, () => Boolean(null));
  main.toCustom = valueToCustom(main);

  return main;
}
