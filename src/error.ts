import {
  valueToBoolean,
  valueToCustom,
  valueToNumber,
  valueToString,
} from './converters.js';
import { makePrimitiveValidator } from './shared.js';
import { ErrorValidator, KeyedError } from './types.js';

export function error() {
  const main = makePrimitiveValidator([], [], (v, k = '') => {
    if (v !== null) {
      throw new KeyedError(k, `Value ${v} is not an error`);
    }
  }) as ErrorValidator;

  main.toString = valueToString(main, (v) => String(v));
  main.toNumber = valueToNumber(main, () => Number(null));
  main.toBoolean = valueToBoolean(main, () => Boolean(null));
  main.toCustom = valueToCustom(main);

  return main;
}
