# Node 개발 TDD



## lower-case 단위 테스트

------

```javascript
var helper = require("node-red-node-test-helper");
var lowerNode = require("../lower-case.js");

// Noder-red 공식 문서 예제에는 없는 라인 (helper가 제대로 초기화되지 않아 추가)
helper.init(require.resolve('node-red'));

describe('lower-case Node', function () {

  afterEach(function () {
    helper.unload();
  });

	// 로드가 잘 되지는 확인
  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "lower-case", name: "test name" }];
    helper.load(lowerNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });
	
	// flow : n1 -> n2
	// n1의 payload로 "UpperCase" 입력
	// n2의 payload가 "uppercase"인지 검사 (소문자로 변경이 잘 동작하는지 테스트)
  it('should make payload lower case', function (done) {
    var flow = [{ id: "n1", type: "lower-case", name: "test name", wires:[["n2"]] },
    { id: "n2", type: "helper" }];
		// helper.load() : flow를 load한 다음 시작
    helper.load(lowerNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        msg.should.have.property('payload', 'uppercase');
        done();
      });
      n1.receive({ payload: "UpperCase" });
    });
  });
});
```

참고 링크 : https://nodered.org/docs/creating-nodes/first-node



## helper API

------

### **load(testNode, testFlows, testCredentials, cb)**

Flow를 Load한 다음 해당 Flow를 시작합니다.

- testNode: (object | array of objects) 테스트할 노드의 모듈 객체가 require 함수에 의해 반환됩니다. 이 노드는 등록되고 testFlows에서 사용할 수 있습니다.
- testFlow: (array of objects) 노드를 테스트하기 위한 Flow data. Node-RED 편집기에서 내보낸 Flow data를 사용하려면 Flow를 클립보드로 내보내고 콘텐츠를 테스트 스크립트에 붙여넣습니다.
- testCredentials: (object) 선택적 노드 자격 증명.
- cb: (function) testFlows가 시작되었을 때 콜백하는 함수.

### **unload()**

모든 Flow를 중지하고 테스트 런타임을 정리하는 promise를 반환합니다.

### **getNode(id)**

testFlow에서 id로 노드 인스턴스를 반환합니다. Flow에 추가된 helper 노드를 포함하여 testFlows에 정의된 모든 노드를 검색할 수 있습니다.

### **clearFlows()**

모든 흐름을 중지합니다.

### **request()**

편집기/관리자 URL에 대한 http( supertest ) 요청을 만듭니다 .

Example:

```javascript
helper.request().post('/inject/invalid').expect(404).end(done);
```

### **settings(userSettings)**

모든 userSettings를 에서 반환된 기본값과 병합합니다 `RED.settings`. 이 메서드를 호출할 때마다 이전 userSettings를 덮어써 테스트에서 예기치 않은 문제가 발생하지 않도록 합니다.

이렇게 하면 테스트 내에서 프로덕션 환경을 복제할 수 있습니다(예: `functionGlobalContext`기능 내에서 추가 노드 모듈을 활성화 하는 데 사용하는 곳) .

`// functions can now access os via global.get('os') helper.settings({ functionGlobalContext: { os:require('os') } });

// reset back to defaults helper.settings({ });`

### **startServer(done)**

디버그 노드와 같은 http 또는 웹 소켓 끝점에 의존하는 노드를 테스트하기 위해 Node-RED 서버를 시작합니다.

모든 테스트 케이스 전에 Node-RED 서버를 시작하려면

```javascript
before(function(done) { helper.startServer(done); });
```

### **stopServer(done)**

서버를 중지합니다. 일반적으로 unload()가 완료된 후에 호출됩니다.

예를 들어 흐름을 unload하려면 각 테스트 후에 서버를 중지합니다.

```javascript
afterEach(function(done) { helper.unload().then(function() { helper.stopServer(done) }); });
```

### **url()**

서버를 시작할 때 사용된 임시 포트를 포함하는 helper 서버의 URL을 반환합니다.

### **log()**

테스트 중인 노드에서 이벤트를 찾기 위해 로그에 대한 스파이를 반환합니다.

For example:

```javascript
var logEvents = helper.log().args.filter(function(evt { return evt[0].type == "batch"; });
```

참고 링크 : https://www.npmjs.com/package/node-red-node-test-helper



## Node JS 테스트 코드 실행

------

### dependencies

node-red-node-test-helper

node-red

mocha

### mocha

Mocha 는 Node.js 프로그램을 위한 **JavaScript 테스트 프레임워크**로 , 브라우저 지원, 비동기 테스트, 테스트 커버리지 보고서 및 모든 어설션 라이브러리 사용을 특징으로 합니다.

mocha 시작하기 : https://mochajs.org/#installation

### 테스트 코드 실행

file system

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6ade9282-b55a-4c97-b99c-57c9e3be25c7/Untitled.png)

package.json

```javascript
...
"scripts": {
  "test": "mocha test/lower-case_spec.js"
},
...
```

`npm test` 실행

