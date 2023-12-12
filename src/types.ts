/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValueValidationResultInitial {
  initialValue: unknown;
}

export interface ValueValidationErrorInstanceValue {
  value: Error;
}

export interface ValueValidationErrorUnknownValue {
  value: unknown;
}

export interface ValueValidationUnknownError
  extends ValueValidationResultInitial {
  hasError: true;
  error: ValueValidationErrorUnknownValue;
}

export interface ValueValidationInstanceError
  extends ValueValidationResultInitial {
  hasError: true;
  error: ValueValidationErrorInstanceValue;
}

export type ValueValidationError = {
  hasError: true;
  initialValue: unknown;
  error:
    | Record<string, ValueValidationError>
    | ValueValidationError[]
    | KeyedError;
};

export interface ValueValidationSuccess<T>
  extends ValueValidationResultInitial {
  hasError: false;
  result: T;
}

export type ValueValidationResult<T> =
  | ValueValidationSuccess<T>
  | ValueValidationError;

export interface ValidatorFunction<T = any> {
  (v: unknown, k?: string): ValueValidationResult<T>;
}

export type ValidatorResultUnion<T> = T extends T
  ? ValidatorFunction<ValueValidationResult<T>>
  : never;

export type ValidatorUnion<T> = T extends T ? ValidatorFunction<T> : never;

export type ValudationResultType<T> = T extends ValueValidationResult<infer U>
  ? U
  : unknown;

export type ValidatorFunctionResultType<
  T extends (v: unknown, k?: string) => any
> = T extends (v: unknown, k?: string) => ValueValidationResult<infer U>
  ? U
  : never;

export type InferSchema<T extends (v: unknown, k?: string) => any> =
  ValidatorFunctionResultType<T>;

export interface ToNumberFunction<T> {
  (fn?: (v: T) => number): NumberValidator;
}

export interface ToStringFunction<T> {
  (fn?: (v: T) => string): StringValidator;
}

export interface ToBooleanFunction<T> {
  (fn?: (v: T) => boolean): BooleanValidator;
}

export interface ToCustomFunction<T> {
  <C>(fn: (v: T) => C): CustomValidator<C>;
}

export interface ToArrayFunction<T> {
  <K>(fn: (v: T) => K[]): ArrayValidator<K>;
}

export interface CustomValidatorFunctions<C> {
  assert: (assertion: (v: C) => boolean, name: string) => CustomValidator<C>;
}

export interface StringUnionValidator<T extends string[]>
  extends ValidatorFunction<T[number]> {
  toCustom: ToCustomFunction<T[number]>;
  assert: (
    assertion: (v: T) => boolean,
    name: string
  ) => StringUnionValidator<T>;
  not: {
    assert: (
      assertion: (v: T) => boolean,
      name: string
    ) => StringUnionValidator<T>;
  };
}

export interface CustomValidator<T>
  extends ValidatorFunction<T>,
    CustomValidatorFunctions<T> {
  not: CustomValidatorFunctions<T>;
  toBoolean: (fn: (v: T) => boolean) => BooleanValidator;
  toString: (fn: (v: T) => string) => StringValidator;
  toNumber: (fn: (v: T) => number) => NumberValidator;
  toCustom: ToCustomFunction<T>;
  toArray: ToArrayFunction<T>;
}

export interface ArrayValidatorFunctions<T> {
  assert: (assertion: (v: T[]) => boolean, name: string) => ArrayValidator<T>;
  ofExactLength: (value: number) => ArrayValidator<T>;
  empty: () => ArrayValidator<T>;
}

export interface ArrayValidator<T = unknown>
  extends ValidatorFunction<T[]>,
    BaseConvertible<T[]>,
    ArrayValidatorFunctions<T> {
  not: ArrayValidatorFunctions<T>;
  ofMaxLength: (value: number) => ArrayValidator<T>;
  ofMinLength: (value: number) => ArrayValidator<T>;
  items: <K>(
    validator: ValidatorFunction<K>
  ) => ArrayValidator<ValidatorFunctionResultType<ValidatorFunction<K>>>;
}

export interface ObjectValidatorFunctions<T> {
  assert: (assertion: (v: T) => boolean, name: string) => ObjectValidator<T>;
}

export interface ObjectValidator<T = unknown>
  extends ValidatorFunction<T>,
    BaseConvertible<T>,
    ObjectValidatorFunctions<T> {
  not: ObjectValidatorFunctions<T>;
  schema: <X>(s: {
    [K in keyof X]: ValidatorFunction<X[K]>;
  }) => ObjectValidator<ValidatorFunctionResultType<ValidatorFunction<T & X>>>;
  partial: <X>(s: {
    [K in keyof X]: ValidatorFunction<X[K]>;
  }) => ObjectValidator<
    ValidatorFunctionResultType<ValidatorFunction<T & Partial<X>>>
  >;
}

export interface RecordValidator<V extends PropertyKey = string, T = unknown>
  extends ValidatorFunction<{ [K in V]: T }>,
    BaseConvertible<{ [K in V]: T }> {}

export interface NullValidator
  extends ValidatorFunction<null>,
    BaseConvertible<null> {}

export interface ErrorValidator
  extends ValidatorFunction<Error>,
    BaseConvertible<Error> {}

export interface UndefinedValidator
  extends ValidatorFunction<undefined>,
    BaseConvertible<undefined> {}

export interface BaseConvertible<T> {
  toString: ToStringFunction<T>;
  toBoolean: ToBooleanFunction<T>;
  toNumber: ToNumberFunction<T>;
  toCustom: ToCustomFunction<T>;
  toArray: ToArrayFunction<T>;
}

export interface NumberValidatorFunctions {
  allowed: (...v: number[]) => NumberValidator;
  lessThan: (v: number) => NumberValidator;
  moreThan: (v: number) => NumberValidator;
  integer: () => NumberValidator;
  positive: () => NumberValidator;
  negative: () => NumberValidator;
  assert: (assertion: (v: number) => boolean, name: string) => NumberValidator;
  multipleOf: (v: number) => NumberValidator;
  zero: () => NumberValidator;
  equals: (v: number) => NumberValidator;
}

export interface NumberValidator
  extends ValidatorFunction<number>,
    BaseConvertible<number>,
    NumberValidatorFunctions {
  not: NumberValidatorFunctions;
}

export interface StringValidatorFunctions {
  allowed: <T extends string>(...v: T[]) => StringUnionValidator<T[]>;
  matches: (r: RegExp) => StringValidator;
  equals: <T extends string>(v: T) => StringUnionValidator<[T]>;
  empty: () => StringValidator;
  assert: (assertion: (v: string) => boolean, name: string) => StringValidator;
}

export interface StringValidator
  extends ValidatorFunction<string>,
    BaseConvertible<string>,
    StringValidatorFunctions {
  not: Omit<StringValidatorFunctions, 'allowed' | 'equals'> & {
    allowed: (...v: string[]) => StringValidator;
    equals: (v: string) => StringValidator;
  };
  case: (v: 'sensitive' | 'insensitive') => StringValidator;
  orNull: () => StringValidator;
}

export interface BooleanValidatorFunctions {
  true: () => BooleanTrueValidator;
  false: () => BooleanFalseValidator;
  assert: (
    assertion: (v: boolean) => boolean,
    name: string
  ) => BooleanValidator;
}
export interface NegatedBooleanValidatorFunctions {
  true: () => BooleanFalseValidator;
  false: () => BooleanTrueValidator;
  assert: (
    assertion: (v: boolean) => boolean,
    name: string
  ) => BooleanValidator;
}

export type ValidatorGenerator<T extends AnyValidator> = (
  generators?: ((v: unknown, k?: string) => unknown)[]
) => T;

export interface BooleanValidator
  extends ValidatorFunction<boolean>,
    BaseConvertible<boolean>,
    BooleanValidatorFunctions {
  not: NegatedBooleanValidatorFunctions;
}
export interface BooleanFalseValidator
  extends ValidatorFunction<false>,
    BaseConvertible<false> {}
export interface BooleanTrueValidator
  extends ValidatorFunction<true>,
    BaseConvertible<true> {}

export type AnyValidator =
  | BooleanValidator
  | BooleanFalseValidator
  | BooleanTrueValidator
  | NumberValidator
  | StringValidator
  | StringUnionValidator<any>
  | ArrayValidator
  | ObjectValidator
  | UndefinedValidator
  | NullValidator
  | CustomValidator<unknown>;

export class KeyedError extends Error {
  #key: string;
  constructor(key: string, message: string) {
    super(message);
    this.#key = key;
  }

  get key() {
    return this.#key;
  }
}
