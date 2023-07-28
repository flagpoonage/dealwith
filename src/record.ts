import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
} from './converters.js';
import {
  KeyedError,
  ValidatorFunction,
  ValueValidationResult,
  ValueValidationError,
  RecordValidator,
} from './types.js';

export function record<T = unknown, V extends PropertyKey = string>(
  validatorFn: ValidatorFunction<T>
): RecordValidator<V, T> {
  const main = (v: unknown, k = ''): ValueValidationResult<{ [K in V]: T }> => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      return {
        initialValue: v,
        hasError: true,
        error: new KeyedError(k, `Value ${v} is not a record`),
      };
    }

    const each_results = Object.entries(v).map(([k, v], i) =>
      validatorFn(v, [k, `[${i}]`].filter(Boolean).join('.'))
    );

    if (each_results.some((a) => a.hasError)) {
      return {
        initialValue: v,
        hasError: true,
        error: each_results.filter(
          (a): a is ValueValidationError => a.hasError
        ),
      };
    }

    return {
      hasError: false,
      initialValue: v,
      result: v as { [K in V]: T },
    };
  };

  main.toString = valueToString(main, (v) => String(v));
  main.toNumber = valueToNumber(main, (v) => Number(v));
  main.toBoolean = valueToBoolean(main, (v) => Boolean(v));
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  return main;
}
