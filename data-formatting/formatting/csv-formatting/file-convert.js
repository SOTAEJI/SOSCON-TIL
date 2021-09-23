module.exports = function(RED) {
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

    function toPayload(jsonData, title, type, x_label, x_data, y_label, y_data) {
        var X = []
        var Y = []
        for (var r of jsonData) {
            X.push(r[x_data])
            Y.push(r[y_data])
        }
        var chartData = {
            type: type,
            data: {
                labels: X,
                datasets: [{
                    label: y_label,
                    data: Y
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
        return chartData;

    }




    function FileConvertNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        node.on('input', function(msg) {
            var filename = n.filename
            var fullFilename = filename
            if (filename && RED.settings.fileWorkingDirectory && !path.isAbsolute(filename)) {
                fullFilename = path.resolve(path.join(RED.settings.fileWorkingDirectory,filename));
            }
            var data = fs.readFileSync(fullFilename, {encoding: "utf8"});
            var format = n.format
            if (format === 'csv') {
                var rows = data.split("\r\n");
                var result = []
                for (var rowIndex in rows) {
                    var row = rows[rowIndex].split(",");
                    if (rowIndex === "0") {
                        var columns = row;
                    } else {
                        var data = {};
                        for (var columnIndex in columns) {
                            var column = columns[columnIndex];
                            data[column] = row[columnIndex];
                        }
                        result.push(data);
                    }
                }
            }
            msg.payload = result
            var result2 = toPayload(result, 'chart', 'line', 'xlabel', 'index', 'ylabel', 'topic_idx')
            msg.data = result2
            node.send(msg);
        })
    }
    RED.nodes.registerType("file-convert", FileConvertNode);
}