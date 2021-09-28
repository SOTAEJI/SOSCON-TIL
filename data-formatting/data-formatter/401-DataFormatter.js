module.exports = function (RED) {
    const xlsx = require('xlsx');
    const fs = require("fs-extra");
    const os = require("os");
    const path = require("path");
    const xmlParser = require('fast-xml-parser');
    const he = require('he');
    var parents = [];

    function JsonFormatting(jsonData, title, type, x_data, y_label, y_data, nodeConfig) {
        //json formatting
        var X = []
        var Y = []
        console.log(nodeConfig)
        console.log(typeof(Number(nodeConfig.yMin)))
        
        for (var row of jsonData) {
            X.push(row[x_data])
            Y.push(row[y_data])
        }

        var result = {
            type: type,
            data: {
                labels: X,
                datasets: [{
                    label: y_label,
                    backgroundColor: nodeConfig.backgroundColor,
                    borderWidth: nodeConfig.borderWidth,
                    borderColor: nodeConfig.borderColor,
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
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: Number(nodeConfig.yMin),
                            max: Number(nodeConfig.yMax),
                            stepSize: Number(nodeConfig.yStepSize)

                        }
                    }]
                }
            }
        }
        return result;
    }

    function CsvParser(data) {
        //csv to json
        var filename = data;
        var fullFilename = filename;

        if (filename && RED.settings.fileWorkingDirectory && !path.isAbsolute(filename)) {
            fullFilename = path.resolve(path.join(RED.settings.fileWorkingDirectory, filename));
        }

        var csv_data = fs.readFileSync(fullFilename, { encoding: "utf8" });
        var rows = csv_data.split("\r\n");
        var result = [];

        for (var rowIndex in rows) {
            var row = rows[rowIndex].split(",");
            if (rowIndex === "0") {
                var columns = row;
            } else {
                var csv_data = {};
                for (var columnIndex in columns) {
                    var column = columns[columnIndex];
                    csv_data[column] = row[columnIndex];
                }
                result.push(csv_data);
            }
        }
        return result;
    }

    function XlsxParser(data) {
        //xlsx to json
        var xlsx_data = xlsx.readFile(data);

        var sheetnames = Object.keys(xlsx_data.Sheets);
        var sheetname = sheetnames[0];

        var result = xlsx.utils.sheet_to_json(xlsx_data.Sheets[sheetname]);
        return result;
    }

    function XmlParser(data, x_data) {
        //xml to json
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

        var tmp = fs.readFileSync(data, { encoding: "utf8" });
        var xml_data = xmlParser.parse(tmp, xmlOptions);

        console.log(xml_data);

        XmlfindAllParents(xml_data, x_data);

        console.log(parents);

        parents.forEach(key => {
            if (isNaN(key) === true) {
                xml_data = xml_data[key];
            }
        });

        let root = Object.keys(xml_data)[0];
        if (isNaN(root)) xml_data = xml_data[root];

        console.log(xml_data);
        return xml_data;
    }

    function XmlfindAllParents(jsonObj, x_data) {
        if (jsonObj instanceof Object) {
            const keys = Object.keys(jsonObj);
            if (keys.includes(x_data)) {
                return true;
            } else {
                for (let i in keys) {
                    var key = keys[i];
                    parents.push(key);
                    var res = XmlfindAllParents(jsonObj[key], x_data);
                    if (res === false || res == undefined) {
                        parents.pop();
                    }
                }
            }
        }
    }

    function ChartConfig(n) {
        RED.nodes.createNode(this,n);
		this.borderColor = n.borderColor;
		this.borderWidth = n.borderWidth;
        this.backgroundColor = n.backgroundColor;
        this.yMax = n.yMax;
        this.yMin = n.yMin;
        this.yStepSize = n.yStepSize;
        
    }

    function DataFormatting(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        node.on('input', function (msg) {
            var type = n.data_type;
            var jsonData = n.data_src;
            node.configId = n.config;
            RED.nodes.eachNode(function (nn) {
                if(node.configId==nn.id) {
                    node.config = nn;
                }
            });

            //data parsing
            if (type == 'xlsx') jsonData = XlsxParser(n.data_src);
            else if (type == 'csv') jsonData = CsvParser(n.data_src);
            else if (type == 'xml') jsonData = XmlParser(n.data_src, n.x_data);
            
            //change json to chart.js format
            msg.data = JsonFormatting(jsonData, n.title, n.chart_type, n.x_data, n.y_label, n.y_data, node.config);
            node.send(msg);
        })
    }

    RED.nodes.registerType("data-formatter", DataFormatting);
    RED.nodes.registerType("chart-config", ChartConfig);
}

