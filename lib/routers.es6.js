Router.configure({
  layoutTemplate: 'layout'
});

Router.route('authorization/:customerId', {
  name: 'authorization',
  data() {
    return Session.get('authorizationInfo');
  },
  onRun() {
    Session.set('authorizationInfo', null);
    let customerId = this.params.customerId;
    Meteor.call('getPaymentAuthorizationInfo', customerId, function(error, result) {
      Session.set('authorizationInfo', result);
    });
    this.next();
  },
  action() {
    let authorizationInfo = Session.get('authorizationInfo');
    console.log("auth info: ", authorizationInfo);
    if (authorizationInfo) {
      this.render('paymentAuthorization');
    }
  }
});
