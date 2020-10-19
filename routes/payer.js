const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { Payer } = require("../models/payment");
const { initializePayment, verifyPayment } = require("../config/paystack")(request);

const router = express.Router();

// ==================

// Basically this route just handles the form submission and calls the paystack initializePayment function we created in our paystack module.
// After which the response from the initializePayment() is handled: on success redirects to a receipt page or logs the error.

router.post("/paystack", (req, res) => {
  const form = _.pick(req.body, ["amount", "email", "full_name"]);

  form.metadata = {
    full_name: form.full_name,
    month: form.month
  };
  // converts the amount to kobo as paystack only accepts values in kobo
  form.amount *= 100;

  initializePayment(form, (error, body) => {
    if (error) {
      // handle errors
      console.log(error);

      // there will be an error page to return to
      return res.status(404);
    }
    const response = JSON.parse(body);
    console.log(response);
    res.redirect(response.data.authorization_url);
  });
});
// After initializing the payment with paystack, the callback from paystack has some payloads,
// one of which is the reference.
//  This is the unique id that is tied to every transaction made on paystack.
//  We are basically going to use this reference to double check the transaction made

router.get("/paystack/callback", (req, res) => {
  const ref = req.query.reference;
  console.log("test refererence", ref);
  verifyPayment(ref, (error, body) => {
    if (error) {
      // handle errors appropriately

      console.log(error);

      // there will be a redirection to error page
      return res.status(404).send({ message: "payment not successful try again" });
    }
    console.log("i am testing", body);
    const response = JSON.parse(body);

    const data = _.at(response.data, ["reference", "amount", "metadata.month", "customer.email", "metadata.full_name"]);
    console.log("we are checking data", data);
    // eslint-disable-next-line camelcase
    const [reference, amount, month, email, full_name] = data;
    console.log("we are checking Payer", reference, amount, month, email, full_name);
    const newPayer = {
      reference, amount, month, email, full_name
    };

    //  create a payer mongoose model object from the object just created and persist
    //   the data in the database using the save() and redirect the user to the receipt page
    //    if successful otherwise the error page.
    // The receipt route accepts a payer object, of the payer that just made the payment.
    //  This would be displayed on the page, showing the name of the donor and the amount.

    const payer = new Payer(newPayer);

    payer.save().then((result) => {
      if (!result) {
        return res.status(404);
      }
      // eslint-disable-next-line no-underscore-dangle
      // pass an object of the payment
      res.json(payer);
    }).catch((e) => {
      console.log(e);
      res.status(404);
    });
  });
});

router.get("/receipt/:id", (req, res) => {
  const { id } = req.params;
  Payer.findById(id).then((payer) => {
    if (!payer) {
      // handle error when the payer is not found
      res.status(404).send({ message: "payer not found" });
    }
    // redirect to success page
    res.json(payer);
  }).catch((e) => {
    res.status(404);
  });
});
// redirect to error page by the frontend
router.get("/error", (req, res) => {
  res.status(404);
});
module.exports = router;
