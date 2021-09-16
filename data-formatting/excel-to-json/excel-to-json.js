//excel file read
const xlsx = require('xlsx');
const excel_file = xlsx.readFile("/Users/kimnahyeon/Downloads/차트자료 (1).xlsx");

//first sheet
const sheetnames = Object.keys(excel_file.Sheets);
const sheetname = sheetnames[0];

//json result
const result = xlsx.utils.sheet_to_json(excel_file.Sheets[sheetname]);
console.log(result);