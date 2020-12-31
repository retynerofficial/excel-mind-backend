/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const { Payer } = require("../models/payment");

const ValidateSubscription = async (req, res, next) => {
  // Get Authenticated  User Id
  // find time the user paid for subscription
  // do do something like
  // TODO
  const today = new Date();
  const PayerInfo = await Payer.findOne({ email: req.user.email });
  const { paymentTime } = PayerInfo;
  const { expiredTime } = PayerInfo;
  if (moment(expiredTime).diff(today, "days") < 1) {
    res.status(402).send({ error: "true", message: "Sorry, Your subscription has been expired.", result: {} });
  } else {
    next();
  }
};
module.exports = ValidateSubscription;
