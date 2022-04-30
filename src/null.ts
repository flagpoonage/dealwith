import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import { makePrimitiveValidator } from './shared.js';
import { KeyedError, NullValidator } from './types.js';

export function nullValue(
  generators: ((k: string, v: unknown) => unknown)[] = []
) {
  const main = makePrimitiveValidator([], generators, (k, v) => {
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
