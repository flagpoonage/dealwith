import { string } from './string.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { array } from './array.js';
import { object } from './object.js';
import { nullValue } from './null.js';
import { undefinedValue } from './undefined.js';
import { oneof } from './oneof.js';

export const DW = {
  string,
  number,
  boolean,
  array,
  object,
  null: nullValue,
  undefined: undefinedValue,
  oneof,
};

export * from './types.js';
export * from './flatten-error.js';
