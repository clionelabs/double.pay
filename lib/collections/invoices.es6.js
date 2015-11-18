Invoice = _.extend({}, D.Invoice);
Invoices = new Meteor.Collection('invoices', {
  transform : D.Invoice.transform
});