Users = _.extend({}, D.Users, {
  findOneCustomer(selector = {}, options = {}) {
    return D.Users.findOneCustomer(selector, _.extend({
      transform: function (doc) {
        return _.extend(doc, User, Customer);
      }
    }, options));
  },
  findCustomers(selector = {}, options = {}) {
    return D.Users.findCustomers(selector, _.extend({
      transform: function (doc) {
        return _.extend(doc, User, Customer);
      }
    }, options));
  }
});

User = _.extend({}, D.User);

Customer = {
  createVault(nonce) {
    let options = {
      id: this._id,
      firstName: this.profile.firstname,
      lastName: this.profile.lastname,
      paymentMethodNonce: nonce
    };
    let gateway = BraintreeHelper.getInstance().getGateway();
    let wrappedCall = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
    let response = wrappedCall(options);
    console.log("[Customer] createVault request: ", options, JSON.stringify(response));
    if (response.success) {
      this._setAuthorized();
    }
    return response.success;
  },

  getVault() {
    let gateway = BraintreeHelper.getInstance().getGateway();
    try {
      let wrappedCall = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
      let customer = wrappedCall(this._id); // API call return a braintree customer object
      console.log("[Customer] getVault customer: ", customer);
      return customer;
    } catch (err) {
      console.log("[Customer] getVault not found");
      return null;
    }
  },

  getPaymentMethod() {
    let vault = this.getVault();
    if (vault === null) return null;
    if (vault.paymentMethods.length === 0) return null; // not supposed to happen
    return vault.paymentMethods[0]; // Currently, we only allow one payment method, so that one would be the default
  },

  isPaymentMethodAvailable() {
    return this.getPaymentMethod() !== null;
  },

  createAuthorizationToken() {
    let response = BraintreeHelper.getInstance().clientTokenGenerate({});
    return response.clientToken;
  },

  isAuthorized() {
    return this.isPaymentMethodAvailable();
  },

  _setAuthorized() {
    Meteor.users.update(this._id, {$set: {'payment.isAuthorized': true}});
  },

  generateAuthURL() {
    let authURL = Router.routes.authorization.url({customerId: this._id});
    Meteor.users.update(this._id, {$set: {'payment.authURL': authURL}});
  }
}
