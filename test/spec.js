const request = require('supertest');
const Koa = require('koa');
const bodyParser = require('koa-better-body');
const convert = require('koa-convert');
const co = require('co');
const koaJoiBouncer = require('..');

const Joi = koaJoiBouncer.Joi;

describe('koa-joi', () => {
  let app;
  beforeEach(() => {
    app = new Koa();

    app.use(convert(bodyParser({ fields: 'body' })));

    app.use(co.wrap(function* onValidationError(ctx, next) {
      try {
        yield next();
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

    app.use(koaJoiBouncer.middleware({
      body: Joi.object().keys({
        username: Joi
          .string()
          .alphanum()
          .min(3)
          .max(30)
          .required(),
      }),
      headers: Joi.object().keys({
        foo: Joi
          .string()
          .min(5)
          .max(30)
          .required(),
      }),
    }));

    app.use(co.wrap(function* response(ctx, next) {
      ctx.response.body = 'Hello World';
      ctx.response.status = 200;
      yield next();
    }));
  });

  it.only('should reject an invalid request', (done) => {
    request(app.listen())
      .post('/')
      .send({ username: 'a' })
      .expect(400)
      .end(done);
  });

  it('should accept a valid request', (done) => {
    request(app.listen())
      .post('/')
      .send({ username: 'psypersky' })
      .set('foo', 'gkejejnsdfdsf')
      .expect(200)
      // .then(res => console.log(res.statusCode, res.body))
      .end(done);
  });

  it('should parse a valid request', (done) => {
    app.use(co.wrap(function* someMiddleware(ctx, next) {
      try {
        ctx.request.body.test.should.be.type('number');
        done();
      } catch (e) {
        done(e);
      }
      yield next;
    }));

    request(app.listen())
      .post('/')
      .send({ username: 'psypersky', test: 1 })
      .set('foo', 'gkejejnsdfdsf')
      .expect(404)
      .end(Function.prototype);
  });
});
