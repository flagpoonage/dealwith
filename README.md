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

const output = validateAndTransform(data);

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
