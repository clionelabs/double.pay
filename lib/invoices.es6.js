D.Invoice = {};

D.Invoice.Status = {
  Draft : 'draft',
  Issued : 'issued',
  Charged : 'charged',
  Failed : 'failed',
  Voided : 'voided'
};

D.Invoice.ProtoType = {
  adjustments() {
    return _.filter(this.timeBasedItems, function (timeBasedItem) { return timeBasedItem.isAdjustment(); });
  },
  bankedTime() {
    return _.filter(this.timeBasedItems, function (timeBasedItem) { return !timeBasedItem.isAdjustment(); });
  },
  roundedInSecondTotalDuration() {
    return _.reduce(this.bankedTime(), function (memo, timeBasedItem) {
      const duration = timeBasedItem.roundedInSecondTotalDuration();
      return memo + duration;
    }, 0);
  },
  roundedInSecondAdjustment() {
    return _.reduce(this.adjustments(), function (memo, timeBasedItem) {
      const duration = timeBasedItem.roundedInSecondTotalDuration();
      return memo + duration;
    }, 0);
  },
  timePayable() {
    return Math.max(0, (this.roundedInSecondTotalDuration() + this.roundedInSecondAdjustment() - this.creditFromSubscription - this.credit));
  },
  minutePayable() {
    return this.timePayable() / 1000 / 60;
  },
  timeBasedItemsTotal() {
    return this.minutePayable() * this.effectiveRate;
  },
  otherChargesTotal() {
    return _.reduce(this.otherCharges, (memo, otherCharge) => {
      return memo + otherCharge.amount;
    }, 0);
  },
  isEditable() {
    return this.isStatic !== undefined ? false : this.status === D.Invoice.Status.Draft;
  },
  otherChargesRevenueTotal() {
    return _.reduce(this.otherCharges, (memo, otherCharge) => {
      return memo + (otherCharge.isOnBehalf ? 0 : otherCharge.amount);
    }, 0);
  },
  revenue() {
    return this.timeBasedItemsTotal() + this.otherChargesRevenueTotal();
  },
  debit() {
    return this.timeBasedItemsTotal() + this.otherChargesRevenueTotal();
  }
};

D.Invoice.TimeBasedItem = {};
D.Invoice.TimeBasedItem.ProtoType = {
  roundedInSecondTotalDuration() {
    return Math.ceil(this.totalDuration / 1000) * 1000;
  },
  isAdjustment() {
    return this.totalDuration < 0;
  }
};
D.Invoice.transform = function(doc) {
  _.each(doc.timeBasedItems, function(timeBasedItem) {
    _.extend(timeBasedItem, D.Invoice.TimeBasedItem.ProtoType);
  });
  //Invoice.StateMachine(doc);
  return _.extend(doc, D.Invoice.ProtoType);
};
