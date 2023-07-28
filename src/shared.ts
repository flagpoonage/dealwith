import {
  KeyedError,
  ValueValidationError,
  ValueValidationResult,
} from './types.js';

export function makePrimitiveValidator<T>(
  assertions: ((v: T, k?: string) => void)[],
  generators: ((v: unknown, k?: string) => unknown)[],
  generatorAssertion?: (v: unknown, k?: string) => void
): (v: unknown, k?: string) => ValueValidationResult<T> {
  return (value: unknown, k = ''): ValueValidationResult<T> => {
    try {
      const generated_value = generators.reduce(
        (acc, val) => val(acc, k),
        value
      );
      generatorAssertion?.(generated_value, k);

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
  assertions: ((v: T, k?: string) => void)[],
  value: T
): ValueValidationResult<T> {
  try {
    assertions.forEach((assertion) => assertion(value, key));
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
  (v: T, k = '') => {
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
