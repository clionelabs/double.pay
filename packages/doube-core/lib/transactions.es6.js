D.Transaction = {
  Status : {
    NOT_SUBMITTED : 'not-submitted',
    SUBMITTED: 'submitted',
    SETTLED: 'settled',
    FAILED: 'failed',
    VOIDED: 'voided'
  }
};

D.Transactions = new Meteor.Collection('d-transactions');

D.Transactions.allow({
  insert(userId) {
    return Users.isAdmin(userId) || Users.isAssistant(userId);
  },
  update(userId) {
    return Users.isAdmin(userId) || Users.isAssistant(userId);
  },
  remove(userId) {
    return Users.isAdmin(userId) || Users.isAssistant(userId);
  }
});