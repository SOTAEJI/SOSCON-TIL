module.exports = function(RED) {
    function FileConvertNode(n) {
        var fs = require("fs-extra");
        var os = require("os");
        var path = require("path");
        var iconv = require("iconv-lite")

        function encode(data, enc) {
            if (enc !== "none") {
                return iconv.encode(data, enc);
            }
            return Buffer.from(data);
        }

        function decode(data, enc) {
            if (enc !== "none") {
                return iconv.decode(data, enc);
            }
            return data.toString();
        }
        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {
            var data = fs.readFileSync(n.filename, {encoding: "utf8"});
            msg.payload = data
            node.send(msg);
        })
    }
    RED.nodes.registerType("file-convert", FileConvertNode);
}