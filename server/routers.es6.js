Router.route('/settle', function() {
  let req = this.request;
  let res = this.response;
  let gateway = BrainTreeGateway.get();
  gateway.testing.settle(req.query.tid, function(err, settleResult) {
    if (!err) {
      console.log(settleResult);
    } else {
      console.log(err);
    }
  });
  return res.end();
}, { where : 'server'});