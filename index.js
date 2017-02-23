
const Joi = require('joi');
const debug = require('debug')('koa-joi-bouncer');
const co = require('co');

const options = {
  abortEarly: false,
  allowUnknown: true,
};

function createValidatorMiddleware(schemas) {
  return co.wrap(function* validatorMiddleware(ctx, next) {
    const validationPromises = Object.keys(schemas).map(schemaKey =>
      new Promise((resolve, reject) => {
        debug('validating ', schemaKey);
        Joi.validate(
          ctx.request[schemaKey], schemas[schemaKey], options, (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
      }));
    yield validationPromises;
    yield next();
  });
}

module.exports = {
  middleware: createValidatorMiddleware,
  Joi,
};
