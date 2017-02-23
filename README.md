
# Koa-joi-bouncer

__An http parameter validation library for Koa.js web apps__

`npm install --save koa-joi-bouncer`

# The idea

Separate the validation logic from the route itself, just define an schema and use it before the route.

# Usage

```js
const koa = require('koa');
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

const myRoute = function* myRouter(next) {
  this.response.body = `Hello there ${this.request.body.username}`;
}

router.post('/myroute', myRouteValidation, myRoute);

app.use(function* onValidationError(next) {
  try {
    yield next;
  } catch (e) {
    if (!e.isJoi) {
      throw e;
    }
    this.response.body = {
      status: 'fail',
      details: e.details,
    };
    this.response.status = 400;
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
```

Check the tests for more examples

TODO:
- Allow sending options to JOI
- Allow more specification for the validation key e.g. 'request.body2'
