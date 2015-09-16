BrainTreeGateway = {
  get() {
    let environment = Meteor.settings.braintree.isProduction?
      Braintree.Environment.Production: Braintree.Environment.Sandbox;

    return BrainTreeConnect({
      environment: environment,
      merchantId: Meteor.settings.braintree.merchantId,
      publicKey:  Meteor.settings.braintree.publicKey,
      privateKey: Meteor.settings.braintree.privateKey
    });
  }
};
