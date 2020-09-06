const paystack = (request) => {
  // this the test secret key from paystack dashboard
  const MySecretKey = "Bearer sk_test_2b5d5a21c670a33a0bbacd6aa313381584dffa89";

  // This function initializes a Paystack transaction which returns an authorization url or an error as the case may be.
  // Its purpose is to initialize the transaction and return the response of the request to where it was called.
  // the form arguement represent the data that will collect from response.body of the payers from
  const initializePayment = (form, mycallback) => {
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        authorization: MySecretKey,
        "content-type": "application/json",
        "cache-control": "no-cache"
      },
      form
    };
    const callback = (error, response, body) => mycallback(error, body);
    request.post(options, callback);
  };

  const verifyPayment = (ref, mycallback) => {
    const options = {
      url: `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      headers: {
        authorization: MySecretKey,
        "content-type": "application/json",
        "cache-control": "no-cache"
      }
    };
    const callback = (error, response, body) => mycallback(error, body);
    request.post(options, callback);
  };

  return { initializePayment, verifyPayment };
};

module.exports = paystack;
