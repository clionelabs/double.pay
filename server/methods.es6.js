Meteor.methods({
  getPaymentAuthorizedInfo(customerId) {
    let customer = Users.findOneCustomer(customerId);
    let data = {
      customerId: customerId,
      customer: customer
    }
    return data;
  },

  getPaymentAuthorizationInfo(customerId) {
    let customer = Users.findOneCustomer(customerId);
    let clientToken = customer.createAuthorizationToken();
    let data = {
      customerId: customerId,
      customer: customer,
      clientToken: clientToken
    }
    return data;
  },

  authorizePayment(data) {
    console.log("[Methods] authorizePayment: ", data);
    let customerId = data.customerId;
    let customer = Users.findOneCustomer(customerId);
    let nonce = data.nonce;
    let result = customer.updatePaymentMethod(nonce);
    if (!result) {
      throw Meteor.Error("Authorization Error", "Failed to create payment method");
    }
    return true;
  }
});
