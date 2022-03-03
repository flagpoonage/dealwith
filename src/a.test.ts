import D from './index';

const schema = D.object().schema({
  body: D.object().schema({
    username: D.string().assert((v) => v.length > 2),
    password: D.string().assert((v) => v.length > 16),
    secret: D.string(),
    vals: D.array().items(
      D.oneof(D.string(), D.object().schema({ test: D.number() }))
    ),
    cust: D.string().toCustom((v) => {
      throw new Error('test');
    }),
  }),
});

const result = schema('', {
  body: {
    username: 'james',
    password: 'paass',
    secret: 'test',
    vals: ['1', { test: 'hello' }, 3, 4],
    cust: 'aqwer',
  },
});

if (!result.hasError) {
  result.result;
} else {
  result.error;
}

console.log(result);
