/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const { Payer } = require("../models/payment");

const ValidateSubscription = async (req, res, next) => {
  // Get Authenticated  User Id
  // find time the user paid for subscription
  // do do something like
  // TODO
  const PayerInfo = await Payer.findOne({ email: req.user.email });
  console.log(PayerInfo);
  const { paymentTime } = PayerInfo;
  const { expiredTime } = PayerInfo;
  console.log((moment(expiredTime).diff(paymentTime, "days")));
  if (moment(expiredTime).diff(paymentTime, "days") > 2) {
    next();
  } else {
    res.status(402).send({ error: "true", message: "Sorry, Your subscription has been expired.", result: {} });
  }
};
module.exports = ValidateSubscription;
