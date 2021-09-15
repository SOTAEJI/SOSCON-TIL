module.exports = function(RED) {
    function XmlFormatterNode(n) {
        const fs = require('fs');
        const xmlParser = require('fast-xml-parser');
        const he = require('he');
        var title = '식품영양성분';
        var type = 'bar';
        var x_data = 'DESC_KOR'; // 식품이름
        var x_label = '식품이름';
        var y_data = 'NUTR_CONT1'; // 칼로리
        var y_label = '칼로리';
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

        function findAllParents(jsonObj) {
            if (jsonObj instanceof Object) {
                const keys = Object.keys(jsonObj);
                if (keys.includes(x_data)) {
                    return true;
                } else {
                    for (let i in keys) {
                        var key = keys[i];
                        parents.push(key);
                        var res = findAllParents(jsonObj[key]);
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
            // console.log(root, ' ' , isNaN(root));
            if (isNaN(root)) {
                jsonObj = jsonObj[root];
            }
            return jsonObj;
        }

        function toPayload(jsonData, title, type, x_label, x_data, y_label, y_data) {
            var X = []
            var Y = []
            for (var r of jsonData) {
                //console.log('r', r);
                //console.log(r[x_data], r[y_data]);
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

        //////////////////////////////////////////////////////////////////////////////////////

        RED.nodes.createNode(this, n);
        var node = this;

        node.on('input', function(msg) {
            const jsonObj = xmlParser.parse(msg.payload, xmlOptions);
            findAllParents(jsonObj);
            const slicedObj = slice(jsonObj);
            const payload = toPayload(slicedObj, title, type, x_label, x_data, y_label, y_data);
            msg.payload = payload;
            node.send(msg);
        });
    }
    RED.nodes.registerType("xml-formatter-food-test", XmlFormatterNode);
}