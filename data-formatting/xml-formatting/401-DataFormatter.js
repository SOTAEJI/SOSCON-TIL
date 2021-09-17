module.exports = function(RED) {
    function DataFormatterNode(config) {
        const fs = require('fs');
        const xmlParser = require('fast-xml-parser');
        const he = require('he');
        var parents = [];
        const xmlOptions = {
            attributeNamePrefix: "@_",
            attrNodeName: "attr", //default is 'false' 
            textNodeName: "#text",
            ignoreAttributes: true,
            ignoreNameSpace: false,
            allowBooleanAttributes: false,
            parseNodeValue: true,
            parseAttributeValue: false,
            trimValues: true,
            cdataTagName: "__cdata", //default is 'false' 
            cdataPositionChar: "\\c",
            parseTrueNumberOnly: false,
            arrayMode: false, //"strict" 
            attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }), //default is a=>a 
            tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a 
            stopNodes: ["parse-me-as-string"]
        };

        function findAllParents(jsonObj, x_data) {
            if (jsonObj instanceof Object) {
                const keys = Object.keys(jsonObj);
                if (keys.includes(x_data)) {
                    return true;
                } else {
                    for (let i in keys) {
                        var key = keys[i];
                        parents.push(key);
                        var res = findAllParents(jsonObj[key], x_data);
                        if (res === false || res == undefined) {
                            parents.pop();
                        }
                    }
                }
            }
        }

        function slice(jsonObj) {
            parents.forEach(key => {
                // 숫자가 아닌 경우에만 
                if (isNaN(key) === true) {
                    jsonObj = jsonObj[key];
                }
            });

            let root = Object.keys(jsonObj)[0];
            if (isNaN(root)) {
                jsonObj = jsonObj[root];
            }
            return jsonObj;
        }

        function toPayload(jsonData, title, type, x_label, x_data, y_label, y_data) {
            var X = []
            var Y = []
            for (var r of jsonData) {
                X.push(r[x_data])
                Y.push(r[y_data])
            }

            var msg = {
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
            return msg;
        }

        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            var title = config.title;
            var chart_type = config.chart_type;
            var x_data = config.x_data; //'DESC_KOR'; 
            var x_label = config.x_label; //'식품이름';
            var y_data = config.y_data; //'NUTR_CONT1'; 
            var y_label = config.y_label //'칼로리';
            console.log(title, ' ', chart_type, ' ', x_data, ' ', x_label, ' ', y_data, y_label);
            var jsonObj = xmlParser.parse(msg.payload, xmlOptions);
            console.log(jsonObj);
            findAllParents(jsonObj, x_data);
            console.log(parents);
            var slicedObj = slice(jsonObj);
            //console.log(slicedObj);
            var chartPayload = toPayload(slicedObj, title, chart_type, x_label, x_data, y_label, y_data);
            msg.payload = chartPayload;

            node.send(msg);
        });
    }
    RED.nodes.registerType("data-formatter", DataFormatterNode);
}