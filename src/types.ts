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

export type ValudationResultType<T> = T extends ValueValidationResult<infer U>
  ? U
  : unknown;

export type ValidatorFunctionResultType<
  T extends (v: unknown, k?: string) => any
> = T extends (v: unknown, k?: string) => ValueValidationResult<infer U>
  ? U
  : never;

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
  schema: <T>(s: {
    [K in keyof T]: ValidatorFunction<T[K]>;
  }) => ObjectValidator<ValidatorFunctionResultType<ValidatorFunction<T>>>;
}

export interface NullValidator
  extends ValidatorFunction<null>,
    BaseConvertible<null> {}

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
  allowed: (...v: string[]) => StringValidator;
  matches: (r: RegExp) => StringValidator;
  equals: (v: string) => StringValidator;
  empty: () => StringValidator;
  assert: (assertion: (v: string) => boolean, name: string) => StringValidator;
}

export interface StringValidator
  extends ValidatorFunction<string>,
    BaseConvertible<string>,
    StringValidatorFunctions {
  not: StringValidatorFunctions;
  case: (v: 'sensitive' | 'insensitive') => StringValidator;
  orNull: () => StringValidator;
}

export interface BooleanValidatorFunctions {
  true: () => BooleanValidator;
  false: () => BooleanValidator;
  assert: (
    assertion: (v: boolean) => boolean,
    name: string
  ) => BooleanValidator;
}

export type ValidatorGenerator<T extends AnyValidator> = (generators?: ((v: unknown, k?: string) => unknown)[]) => T;

export interface BooleanValidator
  extends ValidatorFunction<boolean>,
    BaseConvertible<boolean>,
    BooleanValidatorFunctions {
  not: BooleanValidatorFunctions;
}

export type AnyValidator =
  | BooleanValidator
  | NumberValidator
  | StringValidator
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
