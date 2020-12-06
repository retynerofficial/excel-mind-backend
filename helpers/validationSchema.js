const Joi = require("@hapi/joi");

const userSchema = Joi.object().keys({
  email: Joi.string().trim().email({ minDomainSegments: 2 }).label("email")
    .required(),
  firstname: Joi.string().trim().alphanum().min(3)
    .max(16)
    .label("firstname")
    .required(),
  lastname: Joi.string().trim().alphanum().min(3)
    .max(16)
    .label("lastname")
    .required(),
  role: Joi.string().trim().label("role").required()
    .min(2),
  password: Joi.string().trim().label("password").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*;])(?=.{8,})/, "required password strength")
    .required(),
  confirmPassword: Joi.ref("password")
});

const loginSchema = Joi.object().keys({
  email: Joi.string().trim().email({ minDomainSegments: 2 }).label("email")
    .required(),
  // password: Joi.string().trim().label("password").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*;])(?=.{8,})/, "required password strength")
    // .required()

});

const recoverSchema = Joi.object().keys({

  password: Joi.string().trim().label("password").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*;])(?=.{8,})/, "required password strength")
    .required(),
  confirmPassword: Joi.ref("password")

});
module.exports = { userSchema, loginSchema, recoverSchema };
