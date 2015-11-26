/**
 * @property {String} invoiceId InvoiceId in double.dashboard
 * @property {String} customerId
 * @property {Number} amount
 * @property {String} braintreeTransactionId
 */
Transactions = new Meteor.Collection("d-pay-transactions", {
  transform: function(doc) {
    return _.extend(doc, Transaction);
  }
});

Transactions.Statuses = {
  NOT_SUBMITTED : 'not-submitted',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
  SETTLED: 'settled',
  FAILED: 'failed',
  VOIDED: 'voided'
};

/**
 * Create transaction with the invoice data from double.dashboard
 *
 * InvoiceId should be unique - make sure it's not been created before
 * taskId and oneTimePurchaseId should be unique - make sure it's not been created before
 */
Transactions.create = (data) => {
  let transaction = Transactions.findOne({data: data});
  if (transaction) {
    throw '[Transactions] transaction already existed for invoice / one time purchase: ' + JSON.stringify(data);
  }

  let doc = {
    data : data,
    status: Transactions.Statuses.NOT_SUBMITTED
  };
  return Transactions.insert(doc);
};

Transactions.linkBrainTree = (transactionId, braintreeTransactionId) => {
  return Transactions.update(transactionId,
    {$set : { braintreeTransactionId : braintreeTransactionId, status : Transactions.Statuses.SUBMITTED }});
};
Transactions.settle = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionSuccess', transaction.data); // notify double.dashboard to update invoice status
  return Transactions.update(transactionId, {$set : {status : Transactions.Statuses.SETTLED }});
};
Transactions.fail = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionFailure', transaction.data); // notify double.dashboard to update invoice status
  return Transactions.update(transactionId, {$set : {status : Transactions.Statuses.FAILED }});
};
Transactions.void = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionVoid', transaction.data); // notify double.dashboard to update invoice status
  return Transactions.update(transactionId, {$set : {status : Transactions.Statuses.VOIDED }});
};

Transaction = {
  submit() {
    // Make sure the transaction has not been submitted before
    if (this.status !== Transactions.Statuses.NOT_SUBMITTED) {
      console.error('[Transactions] transaction already been submitted: ', JSON.stringify(this));
      return;
    }
    let transaction = this;
    let customer = Users.findOneCustomer(this.data.customerId);
    let paymentMethod = customer.getPaymentMethod();
    if (!paymentMethod) {
      console.error('[Transactions] the payment method customerId(' + customer._id + ") is not founded");
      return;
    }
    Transactions.update(transaction._id, {$set : {status : Transactions.Statuses.SUBMITTING }});
    BrainTreeGateway.get().transaction.sale({
      paymentMethodToken : paymentMethod.token,
      amount : this.data.amount,
      options: {
        submitForSettlement: true
      }
    }, function(err, result) {
      if (!err) {
        if (result.success) {
          let externalId = result.transaction.id;
          console.log("[Transactions] sales succeed. brainTransactionId: "+ result.transaction.id);
          console.log("[Transactions] data", transaction.data);
          Transactions.linkBrainTree(transaction._id, externalId);
        } else {
          console.error("[Transactions] sales failed: ", result.message);
          console.error("[Transactions] data", transaction.data);
          Transactions.fail(transaction._id);
        }
      } else {
        console.error("[Transactions] sales error: ", err);
        console.error("[Transactions] data", transaction.data);
        Transactions.fail(transaction._id);
      }
    });
  }
};
