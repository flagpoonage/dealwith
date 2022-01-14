import { string } from './string';
import { number } from './number';
import { boolean } from './boolean';
import { array } from './array';
import { object } from './object';
import { nullValue } from './null';
import { undefinedValue } from './undefined';
import { oneof } from './oneof';

const dealwith = {
  string,
  number,
  boolean,
  array,
  object,
  null: nullValue,
  undefined: undefinedValue,
  oneof,
};

export * from './types';
export default dealwith;
