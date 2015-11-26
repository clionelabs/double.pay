TransactionScheduler = {
  /**
   * Loop through all submitted transactions, and check their statuses in braintree
   *   update the doc according to the new statuses, if any
   */
  checkSettled: () => {
    let transactionSubmitted = Transactions.find({ status : Transactions.Statuses.SUBMITTED }).fetch();
    let gateway = BrainTreeGateway.get();
    _.each(transactionSubmitted, function(transaction) {
      gateway.transaction.find(transaction.braintreeTransactionId, function(err, externalTransaction) {
        if (!err) {
          if (externalTransaction.status === 'settled') {
            Transactions.settle(transaction._id);
          } else if (_.indexOf([
                'settlement_declined',
                'failed',
                'gateway_rejected',
                'processor_declined'], externalTransaction.status) !== -1) {
            Transactions.fail(transaction._id);
          } else if (externalTransaction.status === 'voided') {
            Transactions.void(transaction._id);
          } else if (externalTransaction.status === 'submitted') {
            //Do Nothing
          } else {
            console.log('[TransactionSchedule] checkSettled status unknown: ', transaction.status);
          }
        } else {
          console.log('[TransactionSchedule] checkSettled error: ', err, transaction);
        }
      })
    });
  }
};
