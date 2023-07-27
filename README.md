# dealwith

Typescript data validator and transformer.

## Usage

Chain the API together to build up a schema validator function

```typescript
const dw = require('dealwith');

const schema = dw.object().schema({
  name: dw.string().matches(/\w+/),
  value: dw.array().items(
    dw.oneof(
      dw.string(),
      dw.number()
    )
  )
})
```

Give the function some data to validate

```typescript
// Type: unknown
const data = dataFromUnknownSource();

const output = schema(data);
```

Automatically returns the result with proper typing:

```typescript
if (!output.hasError) {
  /*
    Type of output.result = {
      name: string;
      value: (string | number)[];
    }
  */
  console.log(output.result);
}
```

## Transforming

A lot of libraries deliberately avoid transforming, but this one does the opposite. You can transform and validate at the same time.

```typescript
const validateAndTransform = dw.object().schema({
  name: dw.string().matches(/\w+/),
  value: dw.array().items(
    dw.oneof(
      dw.string().toNumber(),
      dw.number()
    )
  )
}).toCustom(v => ({
  name_transformed: v.name,
  value_array: v.filter(a => a > 0)
}));

const data = {
  name: 'test',
  value: [1,2,0, '5', 0, '9']
}

const output = validateAndTransform('', data);

if (!output.hasError) {
  /*
    Type of output.result = {
      name_transformed: string;
      value_array: number[]
    };

    Value of output.result = {
      name_transformed: 'test',
      value: [1,2,5,9]
    }
  */
  console.log(output.result);
}
```

## Result object

The output of executing a schema is always the same type regardless of errors:

```typescript
type ValueValidationResult<T> = {
  initialValue: unknown;
  hasError: true;
  error:
    | Record<string, ValueValidationError>
    | ValueValidationError[]
    | KeyedError;
} | {
  initialValue: unknown;
  hasError: false;
  result: T;
}
```
This union can be narrowed easily using the `hasError` property. If the `hasError` property is `true`, the type will be narrowed to:

```typescript
{
  initialValue: unknown;
  hasError: true;
  error:
    | Record<string, ValueValidationError>
    | ValueValidationError[]
    | KeyedError;
}
```

And if the `hasError` property is `false` the type can be narrowed to:

```typescript
{
  initialValue: unknown;
  hasError: false;
  result: T;
}
```

The simplest way to narrow the type is to use an if statement, as shown in the example below.

```typescript
const output = someSchema(someData);

if (output.hasError) {
  // Typescript narrows the type here so that `output.result` is
  // not accessible and `output.error` is.
  console.log('Error', output.error);
}
else {
  // Likewise, typescript narrows the type in the opposite direction
  // `output.error` is not accessible here, but `output.result` is.
  console.log('Success', output.result);
}
```

## How it works 

This library is built on fairly functional programming concepts. If you're not familiar with at least the concept of first class functions, the following un-functional examples may help you to understand the source better.

Note than the code provided in this section is not real code, it is an approximation of how the actual code functions, but written in an imperative style.

### Single type example

```typescript
const schema = D.number().moreThan(5).lessThan(10)
```

This produces a single validator function with two value level assertions


```typescript
// Various value assertions
function greaterThan (key: string,v: number) {
  if (v > 5) {
    return;
  }

  throw new KeyedError(key, `Number ${v} is not greater than 5`);
},

function lessThan (key: string, v: number) {
  if (v < 10) {
    return;
  }

  throw new KeyedError(key, `Number ${v} is not less than 10`);
},

// Final schema
const schema = function (key: string, value: unknown): ValueValidationResult<number> {
  if (typeof value !== 'number') {
    return {
      initialValue: value,
      hasError: true,
      error: KeyedError(key, `Value ${value} is not a number`);,
    };
  }
  
  try {
    lessThan(key, value);
    greaterThan(key, value);
    
    return {
      initialValue: value,
      hasError: false,
      result: value
    }
  }
  catch (exception) {
    return {
      initialValue: value,
      hasError: true,
      result: exception
    }
  }
}
```

### Chaining or nesting

When you create chains or nests of multiple types, it will essentially create two different internal schemas, and link them together under one common wrapper:

```typescript
// There is both a number and a string schema involved here
const schema = D.number().lessThan(5).toString().matches(/\d/);
```

This will create a single schema which maps would be equivalent to something like:

```typescript
// Various value assertions
function lessThan (key: string, v: number) {
  if (v < 5) {
    return;
  }

  throw new KeyedError(key, `Number ${v} is not less than 5`);
},

function matches (key: string, v: string) {
  if (v.matches(/\d/)) {
    return;
  }

  throw new KeyedError(key, `String ${v} does not match /\d/`);
}

// Number schema
function numberSchema (key: string, value: unknown): ValueValidationResult<number> {
  if (typeof value !== 'number') {
    return {
      initialValue: value,
      hasError: true,
      error: KeyedError(key, `Value ${value} is not a number`);,
    };
  }
  
  try {
    lessThan(key, value);
    
    return {
      initialValue: value,
      hasError: false,
      result: value
    }
  }
  catch (exception) {
    return {
      initialValue: value,
      hasError: true,
      result: exception
    }
  }
}

// String schema
function stringSchema (key: string, value: unknown): ValueValidationResult<string> {
  if (typeof value !== 'string') {
    return {
      initialValue: value,
      hasError: true,
      error: KeyedError(key, `Value ${value} is not a string`);,
    };
  }
  try {
    matches(key, value);
    
    return {
      initialValue: value,
      hasError: false,
      result: value
    }
  }
  catch (exception) {
    return {
      initialValue: value,
      hasError: true,
      result: exception
    }
  }
}

// Final schema
const schema = function (key: string, value: unknown): ValueValidationResult<string> {
  const numberResult = numberSchema(key, value);

  if (numberResult.hasError) {
    return numberResult;
  }

  const valueAsString = numberResult.result;

  const stringResult = stringSchema(key, valueAsString);

  return stringResult;
}
```
---
## API

### `string()`

Creates a string validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.string();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: string
  console.log('Output', output.result);
}
```

The following assertions can be used in string schemas

**`equals(value: string)`**

The `equals` assertion ensures that the string value provided, matches exactly the argument to `equals`

```typescript
const schema = D.string().equals('correct');

const a = schema('incorrect'); // hasError = true
const b = schema('correct'); // hasError = false
```

The `not` assertion will ensure that the string value provided does not exactly match the argument to `equals`

```typescript
const schema = D.string().not.equals('correct');

const a = schema('incorrect'); // hasError = false
const b = schema('correct'); // hasError = true
```


**`allowed(values: string[])`**

The `allowed` assertion ensures that the string value provided, matches exactly one of the strings in the argument to `allowed`

```typescript
const schema = D.string().allowed(['yes', 'no']);

const a = schema('yes'); // hasError = false
const b = schema('no'); // hasError = false
const c = schema('hello'); // hasError = true
const d = schema('test'); // hasError = true
```

The `not` assertion will ensure that the string value provided does not exactly match one of the strings in the argument to `allowed`

```typescript
const schema = D.string().not.allowed(['yes', 'no']);

const a = schema('yes'); // hasError = true
const b = schema('no'); // hasError = true
const c = schema('hello'); // hasError = false
const d = schema('test'); // hasError = false
```

**`empty()`**

The `empty` assertion ensures that the string value provided is an empty string `''`

```typescript
const schema = D.string().empty();

const a = schema('incorrect'); // hasError = true
const b = schema(''); // hasError = false
```

The `not` assertion will ensure that the string value provided is not an empty string `''`

```typescript
const schema = D.string().not.empty();

const a = schema('correct'); // hasError = false
const b = schema(''); // hasError = true
```

**`matches()`**

The `matches` assertion ensures that the string value provided matches the regular expression argument

```typescript
const schema = D.string().matches(/\d/);

const a = schema('number one'); // hasError = true
const b = schema('number 1'); // hasError = false
```

The `not` assertion will ensure that the string value provided does not match the regular expression argument

```typescript
const schema = D.string().not.matches(/\d/);

const a = schema('number one'); // hasError = false
const b = schema('number 1'); // hasError = true
```



---


### `number()`

Creates a number validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.number();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: number
  console.log('Output', output.result);
}
```
### `boolean()`

Creates a boolean validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.boolean();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: boolean
  console.log('Output', output.result);
}
```
### `null()`

Creates a null validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.null();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: null
  console.log('Output', output.result);
}
```
### `undefined()`

Creates an undefined validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.undefined();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: undefined
  console.log('Output', output.result);
}
```
### `array()`

Creates an array validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.array();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: any[]
  console.log('Output', output.result);
}
```
### `object()`

Creates an object validator schema.

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.object();

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: object
  console.log('Output', output.result);
}
```
### `oneof()`

Creates a union validation schema, made up of one or more seperate validators

```typescript
import D from 'dealwith';
import { unknownData } from 'unknownData';

const schema = D.oneof(
  D.string(),
  D.number()
);

const output = schema(unknownData);

if (!output.hasError) {
  // output.result type: string | number
  console.log('Output', output.result);
}
```