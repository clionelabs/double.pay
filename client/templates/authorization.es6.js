Template.paymentAuthorized.helpers({
  customerName() {
    return this.customer.profile.firstname;
  }
});

Template.paymentNewAuthorization.helpers({
  customerName() {
    return this.customer.profile.firstname;
  }
});

Template.paymentNewAuthorization.onRendered(function() {
  let instance = this;
  let clientToken = this.data.clientToken;
  let customerId = this.data.customerId;
  let requestSent = false;

  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function(event, nonce) {
      let data = {
        customerId: customerId,
        nonce: nonce
      }

      // The submit button might have been clicked multiple times by customers
      // But there is no easy way to disable the submit button using braintree drop-in UI
      // So we simply allow sending request to our server once
      if (requestSent) return; // There is no way to
      resquestSent = true;

      Meteor.call('authorizePayment', data, function(err) {
        handleAuthorizationCallback(!err, customerId);
      });
    },
    onReady: function () {
      instance.$("button.authorize").show();
    }
  });
});

let handleAuthorizationCallback = function(success, customerId) {
  if (success) {
    Router.go("authorized", {customerId: customerId});
  } else {
    Notifications.error('Authorization failed', 'Failed to process your authorization.');
  }
}
