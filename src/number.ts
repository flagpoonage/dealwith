import {
  valueToString,
  valueToNumber,
  valueToBoolean,
  valueToCustom,
  valueToArray,
} from './converters';
import {
  makeAssertionBuilder,
  makeFunctionAssertion,
  makePrimitiveValidator,
} from './shared';
import { NumberValidator } from './types';

const makeAssertion = makeAssertionBuilder('number');

const makeAllowedAssertion =
  (negate: boolean) => (values: number[]) => (v: number) => {
    const result = negate ? values.indexOf(v) === -1 : values.indexOf(v) !== -1;

    if (!result) {
      throw new Error(
        `Number value ${v} ${
          negate
            ? `is one of the disallowed values in [${values.join(', ')}]`
            : `is not one of the allowed values in [${values.join(', ')}]`
        }`
      );
    }
  };

const makePositiveAssertion = (negate: boolean) => () => (v: number) => {
  makeAssertion(() => (negate ? v < 0 : v > 0), v, 'positive', negate);
};

const makeNegativeAssertion = (negate: boolean) => () => (v: number) => {
  makeAssertion(() => (negate ? v > 0 : v < 0), v, 'negative', negate);
};

const makeZeroAssertion = (negate: boolean) => () => (v: number) => {
  makeAssertion(() => (negate ? v !== 0 : v === 0), v, 'zero', negate);
};

const makeLessThanAssertion =
  (negate: boolean) => (value: number) => (v: number) => {
    makeAssertion(
      () => (negate ? v >= value : v < value),
      v,
      `less than ${value}`,
      negate
    );
  };

const makeMoreThanAssertion =
  (negate: boolean) => (value: number) => (v: number) => {
    makeAssertion(
      () => (negate ? v >= value : v < value),
      v,
      `less than ${value}`,
      negate
    );
  };

const makeEqualsAssertion =
  (negate: boolean) => (value: number) => (v: number) => {
    makeAssertion(
      () => (negate ? v !== value : v === value),
      v,
      `equal to ${value}`,
      negate
    );
  };

const makeMultipleOfAssertion =
  (negate: boolean) => (value: number) => (v: number) => {
    makeAssertion(
      () => (negate ? v % value !== 0 : v % value === 0),
      v,
      `a multiple of ${value}`,
      negate
    );
  };

const makeIntegerAssertion = (negate: boolean) => () => (v: number) => {
  makeAssertion(
    () => (negate ? !Number.isInteger(v) : Number.isInteger(v)),
    v,
    `an integer`,
    negate
  );
};

export function number(generators: ((v: unknown) => unknown)[] = []) {
  const assertions: ((v: number) => void)[] = [];

  const main = makePrimitiveValidator(assertions, generators, (v) => {
    if (typeof v !== 'boolean') {
      throw new Error(`Value ${v} is not an array`);
    }
  }) as NumberValidator;

  main.toString = valueToString(main, (v) => v.toString());
  main.toNumber = valueToNumber(main, (v) => v);
  main.toBoolean = valueToBoolean(main, (v) => v !== 0);
  main.toCustom = valueToCustom(main);
  main.toArray = valueToArray(main);

  const assert =
    (negate: boolean) => (assertion: (v: number) => boolean, name?: string) => {
      assertions.push(
        makeFunctionAssertion<number>(negate, assertion, 'number', name)
      );
      return main;
    };

  main.assert = assert(false);

  main.allowed = (...values: number[]) => {
    assertions.push(makeAllowedAssertion(false)(values));
    return main;
  };

  main.integer = () => {
    assertions.push(makeIntegerAssertion(false)());
    return main;
  };

  main.positive = () => {
    assertions.push(makePositiveAssertion(false)());
    return main;
  };

  main.negative = () => {
    assertions.push(makeNegativeAssertion(false)());
    return main;
  };

  main.lessThan = (v: number) => {
    assertions.push(makeLessThanAssertion(false)(v));
    return main;
  };

  main.moreThan = (v: number) => {
    assertions.push(makeMoreThanAssertion(false)(v));
    return main;
  };

  main.zero = () => {
    assertions.push(makeZeroAssertion(false)());
    return main;
  };

  main.multipleOf = (v: number) => {
    assertions.push(makeMultipleOfAssertion(false)(v));
    return main;
  };

  main.equals = (v: number) => {
    assertions.push(makeEqualsAssertion(false)(v));
    return main;
  };

  main.not = {
    assert: assert(true),

    allowed: (...values: number[]) => {
      assertions.push(makeAllowedAssertion(false)(values));
      return main;
    },

    integer: () => {
      assertions.push(makeIntegerAssertion(false)());
      return main;
    },

    positive: () => {
      assertions.push(makePositiveAssertion(false)());
      return main;
    },

    negative: () => {
      assertions.push(makeNegativeAssertion(false)());
      return main;
    },

    lessThan: (v: number) => {
      assertions.push(makeLessThanAssertion(false)(v));
      return main;
    },

    moreThan: (v: number) => {
      assertions.push(makeMoreThanAssertion(false)(v));
      return main;
    },

    zero: () => {
      assertions.push(makeZeroAssertion(false)());
      return main;
    },

    multipleOf: (v: number) => {
      assertions.push(makeMultipleOfAssertion(false)(v));
      return main;
    },

    equals: (v: number) => {
      assertions.push(makeEqualsAssertion(false)(v));
      return main;
    },
  };

  return main;
}
