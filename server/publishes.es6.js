Meteor.publish('myInvoice', function(invoiceId, token) {
  const invoice = Invoices.findOne({
    _id : invoiceId,
    'token.value' : token,
    'token.expiredAt' : { $gte : moment().valueOf() }
  });
  if (invoice) {
    return [
      Users.findCustomers(invoice.customerId, {
        transform : (doc) => { return _.extend(doc, User); },
        fields : Users.showDisplayOnlyOptions()
      }),
      Invoices.find({
        _id: invoiceId,
        'token.value' : token,
        'token.expiredAt' : { $gte : moment().valueOf() }
      })
    ];
  } else {
    return [];
  }
});
