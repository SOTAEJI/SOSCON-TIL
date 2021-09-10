# xml-parser
commit 날짜 : 210910 금

1. npm 라이브러리 설치 : `npm i`
2. 실행 : `node app.js`
3. 접속 : http://localhost:8000/xml

## local file test
1. 원본 xml 파일 : `./data/AptInfo_small.xml`
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <response>
        <header>
            <resultCode>00</resultCode>
            <resultMsg>NORMAL SERVICE.</resultMsg>
        </header>
        <body>
            <items>
                <item>
                    <건축년도>2007</건축년도>
                    <법정동> 필운동</법정동>
                    <아파트>신동아블루아광화문의 꿈</아파트>
                    <지번>254</지번>
                    <지역코드>11110</지역코드>
                    <img>신동아블루아광화문.jpg</img>
                </item>
                ... 생략
    ```
2. `x_data` : 법정동, `y_data` : 건축년도
3. xml -> json parsing
    ```
    {
        response: {
            header: { resultCode: 0, resultMsg: 'NORMAL SERVICE.' },
            body: { items: [Object], numOfRows: 10, pageNo: 1, totalCount: 57 }
        }
    }
    ```
4. 필요한 x_data, y_data 있는 부분까지 자르기
   ```
    {
        item: [
            {
            '건축년도': 1997,
            '법정동': '평창동',
            '아파트': '갑을',
            '지번': 595,
            '지역코드': 11110,
            img: '평창동갑을.jpg'
            },
            ... 생략
        ]
    }
   ```
5. char.js 그리기 용 payload로 변환
    ```
    {
        "data":{
            "type":"xml",
            "data":{
                "labels":[
                    "필운동",
                    "사직동",
                    "사직동",
                    "내수동",
                    "익선동",
                    "인의동",
                    "이화동",
                    "충신동",
                    "동숭동",
                    "명륜1가",
                    "명륜2가",
                    "창신동",
                    "창신동",
                    "창신동",
                    "창신동",
                    "숭인동",
                    "숭인동",
                    "숭인동",
                    "숭인동",
                    "숭인동",
                    "숭인동",
                    "평동",
                    "홍파동",
                    "교북동",
                    "평창동",
                    "평창동",
                    "평창동",
                    "평창동",
                    "무악동",
                    "무악동"
                ],
                "datasets":[
                    {
                    "label":"건축년도",
                    "data":[
                        2007,
                        2008,
                        2008,
                        2004,
                        2003,
                        2006,
                        2004,
                        2011,
                        1999,
                        2006,
                        1995,
                        1999,
                        1992,
                        1993,
                        1999,
                        2014,
                        2009,
                        2008,
                        2013,
                        2004,
                        2012,
                        2017,
                        2017,
                        2017,
                        1998,
                        2009,
                        1998,
                        1997,
                        2000,
                        2008
                    ]
                    }
                ]
            },
            "options":{
                "responsive":true,
                "legend":{
                    "position":"top"
                },
                "title":{
                    "display":true,
                    "text":"title"
                }
            }
        }
    }

    ```