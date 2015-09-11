BrainTreeGateway = {
  get() {
    return BrainTreeConnect({
      //If you set an ENV variable for PRODUCTION you can dynamically change out sandbox and production
      environment: process.env.PRODUCTION && Braintree.Environment.Production || Braintree.Environment.Sandbox,
      merchantId: Meteor.settings.braintree.merchantId,
      publicKey:  Meteor.settings.braintree.publicKey,
      privateKey: Meteor.settings.braintree.privateKey
    });
  }
};
