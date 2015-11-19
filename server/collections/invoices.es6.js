Invoices.URL = {
  build : (invoiceId, token) => {
    return  `${Meteor.absoluteUrl()}invoices/${invoiceId}?token=${token}`;
  }
};

D.Events.listen('generateInvoiceToken', function(data) {
  console.log('[Events] generateInvoiceToken event received');
  const token = Random.id();
  const invoiceId = data.invoiceId;
  Invoices.update(invoiceId, {
    $set : {
      token : {
        expiredAt : moment().add(5, 'day').valueOf(),
        value : token,
        url : Invoices.URL.build(invoiceId, token)
      }
    }
  });
  return true;
});
