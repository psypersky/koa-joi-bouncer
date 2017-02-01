const request = require('supertest');
const Koa = require('koa');
const bodyParser = require('koa-better-body');
const koaJoiBouncer = require('..');

const Joi = koaJoiBouncer.Joi;

describe('koa-joi', () => {
  let app;
  beforeEach(() => {
    app = new Koa();

    app.use(bodyParser({ fields: 'body' }));

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

    app.use(function* response(next) {
      this.response.body = 'Hello World';
      this.response.status = 200;
      yield next;
    });
  });

  it('should reject an invalid request', (done) => {
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
    app.use(function* someMiddleware(next) {
      try {
        this.request.body.test.should.be.type('number');
        done();
      } catch (e) {
        done(e);
      }
      yield next;
    });

    request(app.listen())
      .post('/')
      .send({ username: 'psypersky', test: 1 })
      .set('foo', 'gkejejnsdfdsf')
      .expect(404)
      .end(Function.prototype);
  });
});
