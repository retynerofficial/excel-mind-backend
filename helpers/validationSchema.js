const Joi = require("@hapi/joi");

const userSchema = Joi.object().keys({
  email: Joi.string().trim().email({ minDomainSegments: 2 }).label("email")
    .required(),
  name: Joi.string().trim().alphanum().min(3)
    .max(16)
    .label("username")
    .required(),
  role: Joi.string().trim().label("role").required()
    .min(3),
  password: Joi.string().trim().label("password").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*;])(?=.{8,})/, "required password strength")
    .required(),
  confirmPassword: Joi.ref("password")
});

module.exports = userSchema;
