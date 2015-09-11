TransactionScheduler = {
  checkSettled: () => {
    let transactionSubmitted = Transactions.find({ status : Transaction.Status.SUBMITTED }).fetch();
    console.log(transactionSubmitted);
    let gateway = BrainTreeGateway.get();
    _.each(transactionSubmitted, function(transaction) {
      gateway.transaction.find(transaction.externalId, function(err, externalTransaction) {
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
          }
        } else {
          console.log(err);
        }
      })
    });
  }
};