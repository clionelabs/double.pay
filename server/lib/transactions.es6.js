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
 */
Transactions.create = (data) => {
  let transaction = Transactions.findOne({invoiceId: data.invoiceId});
  if (transaction) {
    throw '[Transactions] transaction already existed for invoice: ' + JSON.stringify(data);
  }

  let doc = {
    invoiceId: data.invoiceId,
    customerId: data.customerId,
    amount: data.amount,
    status: Transactions.Statuses.NOT_SUBMITTED
  }
  return Transactions.insert(doc);
}

Transactions.linkBrainTree = (transactionId, braintreeTransactionId) => {
  return Transactions.update(transactionId,
    {$set : { braintreeTransactionId : braintreeTransactionId, status : Transactions.Statuses.SUBMITTED }});
};
Transactions.settle = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionSuccess', {invoiceId: transaction.invoiceId}); // notify double.dashboard to update invoice status
  return Transactions.update(transactionId, {$set : {status : Transactions.Statuses.SETTLED }});
};
Transactions.fail = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionFailure', {invoiceId: transaction.invoiceId}); // notify double.dashboard to update invoice status
  return Transactions.update(transactionId, {$set : {status : Transactions.Statuses.FAILED }});
};
Transactions.void = (transactionId) => {
  let transaction = Transactions.findOne(transactionId);
  D.Events.create('transactionVoid', {invoiceId: transaction.invoiceId}); // notify double.dashboard to update invoice status
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
    Transactions.update(transaction._id, {$set : {status : Transactions.Statuses.SUBMITTING }});

    let customer = Users.findOneCustomer(this.customerId);
    let paymentMethod = customer.getPaymentMethod();
    BrainTreeGateway.get().transaction.sale({
      paymentMethodToken : paymentMethod.token,
      amount : this.amount,
      options: {
        submitForSettlement: true
      }
    }, function(err, result) {
      console.log("[Transactions] sale result: ", result, err);
      if (!err) {
        if (result.success) {
          let externalId = result.transaction.id;
          Transactions.linkBrainTree(transaction._id, externalId);
        } else {
          Transactions.fail(transaction._id);
        }
      } else {
        Transactions.fail(transaction._id);
      }
    });
  }
}
