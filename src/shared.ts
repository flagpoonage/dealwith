import {
  KeyedError,
  ValueValidationError,
  ValueValidationResult,
} from './types.js';

export function makePrimitiveValidator<T>(
  assertions: ((k: string, v: T) => void)[],
  generators: ((k: string, v: unknown) => unknown)[],
  generatorAssertion?: (k: string, v: unknown) => void
): (k: string, v: unknown) => ValueValidationResult<T> {
  return (k: string, value: unknown): ValueValidationResult<T> => {
    try {
      const generated_value = generators.reduce(
        (acc, val) => val(k, acc),
        value
      );
      generatorAssertion?.(k, generated_value);

      return runAssertions(k, assertions, generated_value as T);
    } catch (exception) {
      return makeError(value, exception);
    }
  };
}

export function makeError(
  initialValue: unknown,
  exception: unknown
): ValueValidationError {
  // TODO: Simplify the whole error business
  // Dont think any of this is actually necessary

  return {
    initialValue,
    hasError: true,
    error: exception,
  } as ValueValidationError;
}

export function runAssertions<T>(
  key: string,
  assertions: ((k: string, v: T) => void)[],
  value: T
): ValueValidationResult<T> {
  try {
    assertions.forEach((assertion) => assertion(key, value));
    return {
      initialValue: value,
      result: value,
      hasError: false,
    };
  } catch (exception) {
    return makeError(value, exception);
  }
}

export const makeFunctionAssertion =
  <T>(
    negate: boolean,
    assertion: (v: T) => boolean,
    typeName: string,
    assertionName: string
  ) =>
  (k: string, v: T) => {
    const result = negate ? !assertion(v) : assertion(v);

    if (!result) {
      throw new KeyedError(
        k,
        `${typeName ?? typeof v} '${v}' ${
          negate ? 'is' : 'is not'
        } ${assertionName}`
      );
    }
  };

export function makeAssertionFailureMessage(
  typeName: string,
  v: unknown,
  assertion: string,
  negate: boolean
) {
  return `${typeName} ${v} is${negate ? ' ' : ' not '}${assertion}`;
}

export function makeAssertionBuilder(typeName: string) {
  return (
    key: string,
    fn: () => boolean,
    value: unknown,
    name: string,
    negated: boolean
  ) => {
    if (!fn()) {
      throw new KeyedError(
        key,
        makeAssertionFailureMessage(typeName, value, name, negated)
      );
    }
  };
}
