SyncedCron.add({
  name: 'check invoice is settled or not',
  schedule(parser) {
    return parser.cron('*/0.5 * * * *');
  },
  job() {
    TransactionScheduler.checkSettled();
  }
});
