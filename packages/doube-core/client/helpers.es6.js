DateFormatter = {
  toDateString : (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '---';
  },
  toDateTimeString : (date) => {
    return  date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '---';
  },
  toDateMonthString : (date) => {
    return  date ? moment(date).format('MMMM DD, YYYY') : '---';
  },
  toDateShortMonthString : (date) => {
    return  date ? moment(date).format('MMM DD, YYYY') : '---';
  }
};

DurationFormatter = {
  toMinute : (duration) => {
    return duration / 1000 / 60;
  },
  toString : (duration)=> {
    return duration ? moment.duration(duration).humanize(true) : '---';
  },
  toPreciseString : (duration) => {
    return moment.duration(duration).format('hh:mm:ss', { trim : false });
  },
  toPreciseMsString : function(duration) {
    return moment.duration(duration).format('hh:mm:ss.SSS', { trim : false });
  }
};

DurationConverter = {
  minutesToMs : (minute) => {
    return minute * 60 * 1000;
  }
};

AmountFormatter = {
  toString : function(amount) {
    return numeral(amount).format('0,0.00');
  }
};

Template.registerHelper("formatDate", DateFormatter.toDateString);
Template.registerHelper("formatDateTime", DateFormatter.toDateTimeString);
Template.registerHelper("formatDateMonth", DateFormatter.toDateMonthString);
Template.registerHelper('formatDateShortMonth', DateFormatter.toDateShortMonthString);
Template.registerHelper("formatDurationToMinute", DurationFormatter.toMinute);
Template.registerHelper("formatDuration", DurationFormatter.toString);
Template.registerHelper("formatDurationPrecise", DurationFormatter.toPreciseString);
Template.registerHelper("formatDurationPreciseMs", DurationFormatter.toPreciseMsString);

Template.registerHelper("formatAmount", AmountFormatter.toString);

Template.registerHelper('enableIfIsEditing', function(isEditing) {
  return isEditing.get() ? "false" : "true";
});

Template.registerHelper("formatMessage", function(text) {
  text = Blaze.toHTMLWithData(UI._globalHelpers['emojione'], text);
  text = UI._globalHelpers['nl2br'](text);
  return text;
});

Template.registerHelper('not', function(x) {
  return !x;
});

Template.registerHelper('isAdmin', function() {
  return Meteor.userId() && Users.isAdmin(Meteor.userId());
})

Template.registerHelper('getSelectChannelData', function () {
  let customer = Template.currentData().currentCustomer;
  return { _id : customer._id };
});
