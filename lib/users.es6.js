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
  // 1) create a new customer profile if not already existed,
  // 2) remove current payment method if existed, then create a new payment method
  //   so only one payment method will existed at all time
  updatePaymentMethod(nonce) {
    this.createVaultIfNotExisted();
    this.removePaymentMethodIfExisted();
    this.createPaymentMethod(nonce);
    this._setAuthorized();
    return true;
  },

  // remove current payment method
  removePaymentMethodIfExisted() {
    let gateway = BraintreeHelper.getInstance().getGateway();
    let currentPaymentMethod = this.getPaymentMethod();
    if (!currentPaymentMethod) {
      return true;
    }
    let wrappedCall = Meteor.wrapAsync(gateway.paymentMethod.delete, gateway.paymentMethod);
    let response = wrappedCall(currentPaymentMethod.token);
    console.log("[Customer] remove existing method: ", currentPaymentMethod.token, JSON.stringify(response));
  },

  // add a payment method for a customer
  createPaymentMethod(nonce) {
    let gateway = BraintreeHelper.getInstance().getGateway();
    let options = {
      customerId: this._id,
      paymentMethodNonce: nonce
    }
    let wrappedCall = Meteor.wrapAsync(gateway.paymentMethod.create, gateway.paymentMethod);
    let response = wrappedCall(options);
    console.log("[Customer] create new method: ", options, JSON.stringify(response));
  },

  // create a customer profile in braintree
  createVaultIfNotExisted() {
    if (this.getVault()) {
      return true;
    }

    let options = {
      id: this._id,
      firstName: this.profile.firstname,
      lastName: this.profile.lastname
    };
    let gateway = BraintreeHelper.getInstance().getGateway();
    let wrappedCall = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
    let response = wrappedCall(options);
    console.log("[Customer] createVault request: ", options, JSON.stringify(response));
  },

  getVault() {
    let gateway = BraintreeHelper.getInstance().getGateway();
    try {
      let wrappedCall = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
      let customer = wrappedCall(this._id); // API call return a braintree customer object
      console.log("[Customer] Successfully getVault for customerId: " + customer.id);
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
