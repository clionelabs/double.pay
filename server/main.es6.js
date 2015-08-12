let setupBrainTree = function() {
  let environment = Meteor.settings.braintree.isProduction?
    Braintree.Environment.Production: Braintree.Environment.Sandbox;

  let config = {
    environment: environment,
    publicKey: Meteor.settings.braintree.publicKey,
    privateKey: Meteor.settings.braintree.privateKey,
    merchantId: Meteor.settings.braintree.merchantId
  };
  BraintreeHelper.getInstance().connect(config);
}

let setupAuthURLs = function() {
  Users.findCustomers({'payment.authURL': {$exists: false}}).observe({
    added: function(customer) {
      customer.generateAuthURL();
    }
  });
}

Meteor.startup(()=> {
  setupBrainTree();
  setupAuthURLs();
});
