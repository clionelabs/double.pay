Transaction = D.Transaction;
Transactions = D.Transactions;

Transactions.linkTransaction = (transactionId, externalId) => {
    return Transactions.update(
        transactionId,
        { $set : { externalId : externalId, status : Transaction.Status.SUBMITTED }});
};
Transactions.settle = (transactionId) => {
  return Transactions.update(transactionId, {$set : {status : Transaction.Status.SETTLED }});
};
Transactions.fail = (transactionId) => {
    return Transactions.update(transactionId, {$set : {status : Transaction.Status.FAILED }});
};
Transactions.void = (transactionId) => {
    return Transactions.update(transactionId, {$set : {status : Transaction.Status.VOIDED }});
};

Transactions.find({ status : Transaction.Status.NOT_SUBMITTED }).observe({
  added(transaction) {
    let invoiceId = transaction.invoiceId;
    let amount = transaction.amount;
    let customer = Users.findOneCustomer(transaction.customerId);
    let paymentMethod = customer.getPaymentMethod();
    BrainTreeGateway.get().transaction.sale({
      paymentMethodToken : paymentMethod.token,
      amount : amount,
      options: {
        submitForSettlement: true
      }
    }, function(err, result) {
      if (!err) {
        let externalId = result.transaction.id;
        D.Transactions.linkTransaction(transaction._id, externalId);
      } else {
        console.log(err);
        Transactions.fail(transaction._id);
      }
    });
  }
});