const moment = require("moment");
const { Payer } = require("../models/payment");

const ValidateSubscription = async (req, res, next) => {
  // Get Authenticated  User Id
  // find time the user paid for subscription
  // do do something like
  const PayerInfo = await Payer.findOne({ payerId: "userId" });
  const paymentTime = PayerInfo.paymentTimeTimestamp;
  const expiredTime = PayerInfo.expiredTimeTimeStamp;
  if (moment(paymentTime).diff(expiredTime, "days") > 2) {
    next();
  } else {
    res.status(402).send({ error: "true", message: "Sorry, Your subscription has been expired.", result: {} });
  }
};
module.exports = ValidateSubscription;
