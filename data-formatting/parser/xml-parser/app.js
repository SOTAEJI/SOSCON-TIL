const express = require('express'); 
const app = express();
const http = require('http'); 
let server = http.createServer(app);
// xml parsing library 사용
const fs = require('fs');
const xmlParser = require('fast-xml-parser');
const he = require('he');
// local file 사용
let path = './data/AptInfo.xml';
// let path = './data/data_gyeonggi.xml';
const xmlFile = fs.readFileSync(path,'utf8');
const xmlString = xmlFile.toString();
// open api 사용
const request = require('request');
// key target
var x_data = '법정동'; 
// var x_data = 'SIGUN_NM';
var y_data = '건축년도';
// var y_data = 'REFINE_LOTNO_ADDR';
var parents = []; 

// xml passing options
const xmlOptions = { 
    attributeNamePrefix : "@_", 
    attrNodeName: "attr", //default is 'false' 
    textNodeName : "#text", 
    ignoreAttributes : true, 
    ignoreNameSpace : false, 
    allowBooleanAttributes : false, 
    parseNodeValue : true, 
    parseAttributeValue : false, 
    trimValues: true, 
    cdataTagName: "__cdata", //default is 'false' 
    cdataPositionChar: "\\c", 
    parseTrueNumberOnly: false, 
    arrayMode: false, //"strict" 
    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a 
    tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a 
    stopNodes: ["parse-me-as-string"] 
};

app.get('/', function(req, res) {
    res.send('rootpage')
});

app.get('/xml', function(req, res) { // http://localhost:8000/xml 으로 접속
    // 1. local file
    var msg = '';
    console.log('local file 사용 test');
    if(xmlParser.validate(xmlString) === true) {
        const jsonObj = xmlParser.parse(xmlString, xmlOptions);
        findAllParents(jsonObj);
        // parents 배열이 생성됨
        console.log('parents ', parents);
        console.log('전체 jsonObj: ', jsonObj);
        const slicedObj = slice(jsonObj);
        console.log('sliced jsonObj: ', slicedObj);
        const payload = toPayload(slicedObj, 'title', 'xml', x_data, x_data, y_data, y_data);
        console.log('payload for char.js ', payload);
        msg = payload;
    } else {
        msg = 'not valid xml format'
        console.log('not valid');
    }

    // 2. open api
    // console.log('-----------------------------');
    // console.log('Open API test'); // 서비스 키가 필요없는 rss url 사용, 공공 데이터 포털 이용 시에는 serviceKey 포함하여 요청
    // // let requestUrl = '요청url?serviceKey=서비스키';
    // let requestUrl = 'http://rss.nocutnews.co.kr/news/gyeongnam.xml';
    // request.get(requestUrl, (err, res, body) => {
    //     if(err) {
    //         console.log(`err => ${err}`);
    //     } else {
    //         if(res.statusCode == 200) {
    //             var result = body;
    //             //console.log(`body data => ${result}`);
    //             if(xmlParser.validate(result) === true) {
    //                 parents = [];
    //                 x_data = 'title';
    //                 const jsonObj = xmlParser.parse(result, xmlOptions);
    //                 // parents 배열이 생성됨
    //                 console.log('parents: ', parents);
    //                 console.log('전체 jsonObj: ', jsonObj);
    //                 const slicedObj = slice(jsonObj);
    //                 console.log('sliced jsonObj: ', slicedObj);

    //             } else {
    //                 console.log('not valid');
    //             }
    //         }
    //     }
    // });

    res.send(msg);
    // res.send('xmlpage');
});

function findAllParents(jsonObj) { 
    if(jsonObj instanceof Object) {
        const keys = Object.keys(jsonObj); 
        if(keys.includes(x_data)) {
            return true;
        }
        else  {
            for(let i in keys) {
                var key = keys[i];
                parents.push(key);
                var res = findAllParents(jsonObj[key]);
                if(res === false || res == undefined) {
                    parents.pop();
                }
                
            }
        }
    }
}

const slice = function(jsonObj) {
    parents.forEach(key => {
        // 숫자가 아닌 경우에만 
        if(isNaN(key) === true) {
            jsonObj = jsonObj[key];
        }
    });

    let root = Object.keys(jsonObj)[0];
    // console.log(root, ' ' , isNaN(root));
    if(isNaN(root)) {
        jsonObj = jsonObj[root];
    }
    return jsonObj;
}

const toPayload = function(jsonData, title, type, x_label, x_data, y_label, y_data) {
    var msg = {}
    var X = []
    var Y = []
    for (var r of jsonData) {
      //console.log('r', r);
      //console.log(r[x_data], r[y_data]);
      X.push(r[x_data])
      Y.push(r[y_data])
    }
  
    msg.data = {
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
  
server.listen('8000', '127.0.0.1', function() {
	console.log('server listen on port: ' + server.address().port);
})