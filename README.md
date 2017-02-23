
# Koa-joi-bouncer

__An http parameter validation library for Koa.js web apps__

`npm install --save koa-joi-bouncer`

# The idea

Separate the validation logic from the route itself, just define an schema and use it before the route.

# Usage

```js
const koa = require('koa');
const co = require('co');
const app = new koa();
const Router = require('koa-router');
const koaJoiBouncer = require('koa-joi-bouncer');
const Joi = koaJoiBouncer.Joi;

const router = new Router();

const myRouteValidation = koaJoiBouncer.middleware({
  body: Joi.object().keys({
     username: koaJoiBouncer.string().alphanum().min(3).max(30).required(),
  }),
  headers: Joi.object().keys({
    foo: koaJoiBouncer.string().required().
  }),
});

const myRoute = co.wrap(function* myRouter(ctx, next) {
  ctx.response.body = `Hello there ${ctx.request.body.username}`;
});

router.post('/myroute', myRouteValidation, myRoute);

app.use(co.wrap(function* onValidationError(ctx, next) {
  try {
    yield next;
  } catch (e) {
    if (!e.isJoi) {
      throw e;
    }
    ctx.response.body = {
      status: 'fail',
      details: e.details,
    };
    ctx.response.status = 400;
  }
}));

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
```

Check the tests for more examples

TODO:
- Allow sending options to JOI
- Allow more specification for the validation key e.g. 'request.body2'
- Add https://david-dm.org/
- Add https://travis-ci.org/
- Add npm badge
