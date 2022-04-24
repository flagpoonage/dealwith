import { KeyedError } from './types';
import { ValueValidationError } from './types';

export function flattenError(
  error: ValueValidationError,
  errorList: Record<string, string> = {}
): Record<string, string> {
  const value = error.error;
  if (Array.isArray(value)) {
    return {
      ...errorList,
      ...value.reduce((acc, e) => {
        return Object.assign({}, acc, flattenError(e, errorList));
      }, {}),
    };
  } else if (value instanceof KeyedError) {
    return {
      ...errorList,
      [value.key]: value.message,
    };
  }
  return {
    ...errorList,
    ...(Object.entries(value) as [string, ValueValidationError][]).reduce(
      (acc, [, e]) => {
        return Object.assign({}, acc, flattenError(e, errorList));
      },
      {}
    ),
  };
}
