Template.paymentAuthorization.helpers({
  contentTemplate() {
    let authorizationInfo = this;
    if (authorizationInfo.isAuthorized) {
      return 'paymentAuthorized';
    } else {
      return 'paymentNewAuthorization';
    }
  },
});


Template.paymentNewAuthorization.onRendered(function() {
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
        handleAuthorizationCallback(!err);
      });
    }
  });
});

let handleAuthorizationCallback = function(success) {
  if (success) {
    let authorizationInfo = Session.get('authorizationInfo');
    authorizationInfo.isAuthorized = true;
    Session.set('authorizationInfo', authorizationInfo);
  } else {
    Notifications.error('Authorization failed', 'Failed to process your authorization.');
  }
}
