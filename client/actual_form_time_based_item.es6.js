Template.assistantInvoiceActualFormTimeBasedItem.onRendered(function() {
  let tmpl = this;
  if (tmpl.data.isNew) {
    tmpl.data.isEditing.set(true);
  }
  _.extend(tmpl.data, { isEditable : Invoice.ProtoType.isEditable });
  $('textarea.autogrow').autogrow({ onInitialize: true });
});


Template.assistantInvoiceActualFormTimeBasedItem.helpers({
  isEditing() {
    return this.isEditing.get();
  },
  isNotEditing() {
    return !this.isEditing.get();
  }
});

Template.assistantInvoiceActualFormTimeBasedItem.events({
  "click .edit" : function(e, tmpl) {
    let state = this;
    state.isEditing.set(true);
  },
  "click .save" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');
    let timeBasedItemWithExtraInfo = this;
    Invoice.TimeBasedItem.update(
        timeBasedItemWithExtraInfo._id,
        timeBasedItemWithExtraInfo.invoiceId,
        moment(tmpl.$('.date').val()).format('YYYY-MM-DD'),
        tmpl.$('.title').val(),
        tmpl.$('.updates').val(),
        moment.duration(tmpl.$('.duration').val()).valueOf(),
        function() {
          tmpl.$('.loading').addClass('hide');
          timeBasedItemWithExtraInfo.isEditing.set(false);
        }
    );
  },
  "click .delete" : function(e, tmpl) {
    let timeBasedItemWithExtraInfo = this;
    Invoice.TimeBasedItem.delete(
        timeBasedItemWithExtraInfo._id,
        timeBasedItemWithExtraInfo.invoiceId);
  }
});

