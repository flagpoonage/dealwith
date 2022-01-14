import {
  ValueValidationError,
  ValueValidationErrorInstanceValue,
  ValueValidationErrorUnknownValue,
  ValueValidationResult,
} from './types';

export function makePrimitiveValidator<T>(
  assertions: ((v: T) => void)[],
  generators: ((v: unknown) => unknown)[],
  generatorAssertion?: (v: unknown) => void
): (v: unknown) => ValueValidationResult<T> {
  return (value: unknown): ValueValidationResult<T> => {
    try {
      const generated_value = generators.reduce((acc, val) => val(acc), value);
      generatorAssertion?.(generated_value);

      return runAssertions(assertions, generated_value as T);
    } catch (exception) {
      return makeError(value, exception);
    }
  };
}

export function makeError(
  initialValue: unknown,
  exception: unknown
): ValueValidationError {
  const error =
    exception instanceof Error
      ? ({
          isErrorInstance: true,
          value: exception,
        } as ValueValidationErrorInstanceValue)
      : ({
          isErrorInstance: false,
          value: exception,
        } as ValueValidationErrorUnknownValue);

  return {
    initialValue,
    hasError: true,
    error,
  } as ValueValidationError;
}

export function runAssertions<T>(
  assertions: ((v: T) => void)[],
  value: T
): ValueValidationResult<T> {
  try {
    assertions.forEach((assertion) => assertion(value));
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
    assertionName?: string
  ) =>
  (v: T) => {
    const result = negate ? !assertion(v) : assertion(v);

    if (!result) {
      throw new Error(
        `${typeName ?? typeof v} '${v}' failed ${
          assertionName ? `assertion named '${assertionName}'` : 'assertion'
        }`
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
    fn: () => boolean,
    value: unknown,
    name: string,
    negated: boolean
  ) => {
    if (!fn()) {
      throw new Error(
        makeAssertionFailureMessage(typeName, value, name, negated)
      );
    }
  };
}
