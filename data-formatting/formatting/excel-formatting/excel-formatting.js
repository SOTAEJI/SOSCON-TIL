module.exports = function (RED) {
    const xlsx = require('xlsx');

    function toPayload(jsonData, title, type, x_label, x_data, y_label, y_data) {
        var X = []
        var Y = []

        for (var r of jsonData) {
            X.push(r[x_data])
            Y.push(r[y_data])
        }

        var data = {
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
        return data;

    }

    function ExcelFormatting(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            //excel-to-json
            const excel_file = xlsx.readFile(config.filename);
            const sheetnames = Object.keys(excel_file.Sheets);
            const sheetname = sheetnames[0];

            const jsonData = xlsx.utils.sheet_to_json(excel_file.Sheets[sheetname]);
            console.log(jsonData);

            //json-to-js
            msg.data = toPayload(jsonData, config.title, config.chart_type,
                config.x_label, config.x_data, config.y_label, config.y_data);

            node.send(msg);
        })
    }

    RED.nodes.registerType("excel-formatting", ExcelFormatting);
}

