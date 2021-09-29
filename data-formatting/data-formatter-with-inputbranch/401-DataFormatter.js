module.exports = function (RED) {
    const xlsx = require('xlsx');
    const fs = require("fs-extra");
    const os = require("os");
    const path = require("path");
    const xmlParser = require('fast-xml-parser');
    const he = require('he');
    var parents = [];

    function JsonFormatting(X, Y, title, type, y_label) {
        //json formatting
        var result = {
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

    function XlsxParser(xlsxData) {
        //xlsx to json
        var sheetnames = Object.keys(xlsxData.Sheets);
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

        // Open API Test를 위해 코드 수정
        // var tmp = fs.readFileSync(data, { encoding: "utf8" });
        // var xml_data = xmlParser.parse(tmp, xmlOptions);
        var xml_data = xmlParser.parse(data, xmlOptions);

        console.log(xml_data);

        XmlfindAllParents(xml_data, x_data);

        parents.forEach(key => {
            if (isNaN(key) === true) {
                xml_data = xml_data[key];
            }
        });

        let root = Object.keys(xml_data)[0];
        if (isNaN(root)) {
            xml_data = xml_data[root];
        }

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

    function getRowData(jsonData, title, type, x_data, y_label, y_data) {
        var X = [];
        var Y = [];

        for (var row of jsonData) {
            X.push(row[x_data]);
            Y.push(row[y_data]);
        }
        console.log(X);
        console.log(Y);
        return JsonFormatting(X, Y, title, type, y_label);
    }

    function getOverallStatistics(jsonData, title, type, x_data, y_label, y_data) {
        // y데이터의 최대, 최소, 평균 세기
        var total = 0;
        var count = 0;
        var min = jsonData[0][y_data];
        var max = jsonData[0][y_data];

        for (var row of jsonData) {
            total += row[y_data];
            count += 1;
            if (min > row[y_data]) min = row[y_data];
            if (max < row[y_data]) max = row[y_data];
        }

        var average = total / count;

        var X = ['min', 'max', 'count', 'total', 'average'];
        var Y = [min, max, count, total, average];

        return JsonFormatting(X, Y, title, type, y_label);
    }

    function getCountByItems(jsonData, title, type, x_data, y_label) {
        // count the number of x_data items
        var countByItemsJson = {};

        for (var row of jsonData) {
            if (countByItemsJson.hasOwnProperty(row[x_data])) {
                countByItemsJson[row[x_data]] += 1;
            } else {
                countByItemsJson[row[x_data]] = 1;
            }
        }
        var X = (Object.keys(countByItemsJson));
        var Y = (Object.values(countByItemsJson));

        return JsonFormatting(X, Y, title, type, y_label);
    }

    function getTotalByItems(jsonData, title, type, x_data, y_label, y_data) {
        var totalByItems = {};

        for (var row of jsonData) {
            if (totalByItems.hasOwnProperty(row[x_data])) {
                totalByItems[row[x_data]] += row[y_data];
            } else {
                totalByItems[row[x_data]] = row[y_data];
            }
        }

        var X = (Object.keys(totalByItems));
        var Y = (Object.values(totalByItems));

        return JsonFormatting(X, Y, title, type, y_label);
    }

    function getAverageByItems(jsonData, title, type, x_data, y_label, y_data) {
        var averageByItems = {};
        var countByItems = {};

        for (var row of jsonData) {
            if (averageByItems.hasOwnProperty(row[x_data])) {
                averageByItems[row[x_data]] += row[y_data];
                countByItems[row[x_data]] += 1;

            } else {
                averageByItems[row[x_data]] = row[y_data];
                countByItems[row[x_data]] = 1;
            }
        }

        // 평균 구하기
        for (key in averageByItems) {
            averageByItems[key] /= countByItems[key];
        }

        var X = (Object.keys(averageByItems));
        var Y = (Object.values(averageByItems));

        return JsonFormatting(X, Y, title, type, y_label);
    }

    function DataFormatting(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        node.on('input', function (msg) {
            var type = n.data_type;
            var jsonData = n.data_src;
            var data, xlsxData, xmlData, csvData;
            //data entry
            if (n.data_entry_point === 'src') {
                if (type == 'xlsx') {
                    xlsxData = xlsx.readFile(n.data_src);
                } else if (type == 'csv') {
                    var filename = n.data_src;
                    var fullFilename = filename;
                    if (filename && RED.settings.fileWorkingDirectory && !path.isAbsolute(filename)) {
                        fullFilename = path.resolve(path.join(RED.settings.fileWorkingDirectory, filename));
                    }
                    csvData = fs.readFileSync(fullFilename, { encoding: "utf8" });
                }
            }

            if (n.data_entry_point === 'binary') {
                if (type == 'xlsx') {
                    data = Buffer.from(msg.buffer, "base64").toString('base64');
                    xlsxData = xlsx.read(data);
                } else if (type == 'xml') {
                    xmlData = Buffer.from(msg.buffer, "base64").toString('utf8');
                } else if (type == 'csv') {
                    csvData = Buffer.from(msg.buffer, "base64").toString('utf8');
                }
            }

            if (type == 'xlsx') {
                jsonData = XlsxParser(xlsxData);
            }
            else if (type == 'csv') {
                jsonData = CsvParser(csvData);
            }
            else if (type == 'xml') {
                jsonData = XmlParser(xmlData, n.x_data);
                parents = [];
            }

            //data formatting
            if (config.result_data_type === 'totalByItems') {
                msg.data = getTotalByItems(jsonData, config.title, config.chart_type, config.x_data, config.y_label, config.y_data);

            } else if (config.result_data_type === 'countByItems') {
                msg.data = getCountByItems(jsonData, config.title, config.chart_type, config.x_data, config.y_label, config.y_data);

            } else if (config.result_data_type === 'averageByItems') {
                msg.data = getAverageByItems(jsonData, config.title, config.chart_type, config.x_data, config.y_label, config.y_data);

            } else if (config.result_data_type === 'overallStatistics') {
                msg.data = getOverallStatistics(jsonData, config.title, config.chart_type, config.x_data, config.y_label, config.y_data);

            } else {
                msg.data = JsonFormatting(jsonData, config.title, config.chart_type, config.x_data, config.y_label, config.y_data);
            }

            node.send(msg);
        })
    }

    RED.nodes.registerType("data-formatter", DataFormatting);
}