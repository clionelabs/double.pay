Router.configure({
  layoutTemplate: 'layout'
});

Router.route('invoices/:invoiceId', {
  name : 'invoice',
  waitOn() {
    const token = this.params.query.token;
    const invoiceId = this.params.invoiceId;
    return [
      Meteor.subscribe('myInvoice', invoiceId, token)
    ];
  },
  data() {
    const invoiceId = this.params.invoiceId;

    let data = _.extend({}, Invoices.findOne({ _id : invoiceId }));
    const currentCustomer = Users.findOneCustomer(data.customerId, { fields : Users.showDisplayOnlyOptions() });
    if (data && currentCustomer) {
      _.extend(data, {
        isStatic: true,
        isCustomerPaymentMethodAvailable: currentCustomer.hasPaymentMethod(),
        customerFirstName: currentCustomer.firstName(),
        customerFullName: currentCustomer.displayName(),
      });
    };
    return data;
  },
  onBeforeAction() {
    const route = this;
    if (route.params.query.token && route.params.invoiceId) {
      const invoiceId = this.params.invoiceId;
      const token = this.params.query.token;
      const result = Invoices.find(
        {
          _id : invoiceId ,
          'token.value' : token,
          'token.expiredAt' : { $gte : moment().valueOf() }
        }).count();
      if (result) {
        route.next();
      } else {
        //window.location = 'http://double.co';

      }
    } else {
      //window.location = 'http://double.co';
    }
  },
  action() {
    this.render('assistantsInvoiceActualForm');
  }
});

Router.route('authorization/:customerId', {
  name: 'authorization',
  data() {
    return Session.get('authorizationInfo');
  },
  onRun() {
    Session.set('authorizationInfo', null);
    let customerId = this.params.customerId;
    Meteor.call('getPaymentAuthorizationInfo', customerId, function(error, result) {
      Session.set('authorizationInfo', result);
    });
    this.next();
  },
  action() {
    let authorizationInfo = Session.get('authorizationInfo');
    if (authorizationInfo) {
      this.render('paymentAuthorization');
    }
  }
});
