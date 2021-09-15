# Excel to Json

## 방법 1.

### 패키지 설치

- [multiparty](https://www.npmjs.com/package/multiparty): multipart/form-data 형식으로 전송된 파일을 좀 더 편리하게 다룰 수 있도록 도와준다.
- [xlsx](https://www.npmjs.com/package/xlsx): Excel 파일을 다룰 수 있도록 도와준다.

```bash
npm i --save express http body-parser multiparty xlsx
```

### 소스코드

```jsx
const workbook = xlsx.readFile(file.path);
const sheetnames = Object.keys(workbook.Sheets);
 
let i = sheetnames.length;
 
while (i--) {
		const sheetname = sheetnames[i];
    resData[sheetname] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
}
```

### 입력파일

- Excel 파일

    <img width="534" alt="스크린샷 2021-09-06 오후 3 11 18" src="https://user-images.githubusercontent.com/59560592/133441192-bd95e0cb-130a-4f3d-a4c1-30f933d2054d.png">

   
### 결과

- Json 으로 변환

<img width="484" alt="스크린샷 2021-09-06 오후 3 01 20" src="https://user-images.githubusercontent.com/59560592/133441210-ddfddf7f-85c7-4009-a123-5207ebaebfcd.png">


## 방법 2

### 패키지 설치

- [https://www.npmjs.com/package/convert-excel-to-json](https://www.npmjs.com/package/convert-excel-to-json)
- Convert Excel to JSON, mapping sheet columns to object keys.

```bash
npm install convert-excel-to-json
```

### 소스코드

```jsx
const excelToJson = require('convert-excel-to-json');

const result = excelToJson({
   sourceFile: '/Users/kimnahyeon/git/Node/month.xlsx',
   columnToKey: {
      A: '월',
      B: '지출'
   }
});

console.log(result);
```

### 결과

- 키 선택 후 Json 으로 변환

    <img width="256" alt="스크린샷 2021-09-06 오후 3 31 57" src="https://user-images.githubusercontent.com/59560592/133441235-96694c86-2da8-4d59-b225-86bf1e9a4829.png">

