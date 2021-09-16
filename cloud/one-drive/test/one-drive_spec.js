var helper = require("node-red-node-test-helper");
var oneDriveNode = require("../one-drive.js");

helper.init(require.resolve('node-red'));

describe('OneDrive Node', function () {

  afterEach(function () {
    helper.unload();
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "one-drive", name: "test name" }];
    helper.load(oneDriveNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('should make payload OneDrive', function (done) {
    var flow = [{ id: "n1", type: "one-drive", name: "test name",wires:[["n2"]] },
    { id: "n2", type: "helper" }];
    helper.load(oneDriveNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        msg.should.have.property('payload', 'onedrive');
        done();
      });
      n1.receive({ payload: "OneDrive" });
    });
  });
});