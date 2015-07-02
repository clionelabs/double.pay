Meteor.methods({
  getPaymentAuthorizationInfo(customerId) {
    let customer = Users.findOneCustomer(customerId);
    let isAuthorized = customer.isAuthorized();
    let data;
    if (isAuthorized) {
      data = {
        isAuthorized: true,
        customerId: customerId
      }
    } else {
      let clientToken = customer.createAuthorizationToken();
      data = {
        isAuthorized: false,
        customerId: customerId,
        clientToken: clientToken
      }
    }
    return data;
  },

  authorizePayment(data) {
    console.log("[Methods] authorizePayment: ", data);
    let customerId = data.customerId;
    let customer = Users.findOneCustomer(customerId);
    let nonce = data.nonce;
    let result = customer.createVault(nonce);
    if (!result) {
      throw Meteor.Error("Authorization Error", "Failed to create payment method");
    }
    return true;
  }
});
