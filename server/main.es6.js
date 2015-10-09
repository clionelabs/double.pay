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

/**
 * Listent o newTransaction events submitted from double.dashboard
 * and submit ransaction to braintree
 */
let setupTransactionListener = function() {
  D.Events.listen('newTransaction', function(data) {
    if (!data.invoiceId) {
      console.error('missing invoiceId', data);
      return;
    }
    if (!data.customerId) {
      console.error('missing customerId', data);
      return;
    }
    if (!data.amount) {
      console.error('missing amount', data);
      return;
    }

    try {
      let transactionId = Transactions.create(data);
      let transaction = Transactions.findOne(transactionId);
      console.log("submitting transation: ", transaction);
      transaction.submit();
      return true;
    } catch (ex) {
      console.error('[setupTransactionListener] err: ', ex);
      return false;
    }
  });
}

Meteor.startup(()=> {
  setupBrainTree();
  setupAuthURLs();
  setupTransactionListener();

  SyncedCron.start();
});
