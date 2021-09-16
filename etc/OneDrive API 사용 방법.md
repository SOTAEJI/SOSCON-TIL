

# [Node-RED] OneDrive API

<br>

## OneDrive REST API
- 참고

  https://docs.microsoft.com/ko-kr/onedrive/developer/rest-api/?view=odsp-graph-online

## Node.js의 OneDrive API
- 참고

  https://github.com/dkatavic/onedrive-api

<br>

## 시작하기
### Microsoft Graph에 앱 등록

1. Azure 앱 등록 페이지로 이동
2. 메시지가 표시되면 계정 자격 증명으로 로그인
3. 앱 등록 > 새 등록 클릭
4. 앱 이름을 입력하고 애플리케이션 등록 클릭

### 서비스 키 발급

1. 관리 > 인증서 및 암호 클릭
2. 새 클라이언트 암호 생성
3. 비밀 ID 복사

<br>

## ~~Access Token 발급~~ (이거 따라하지 마세요...)

1. 인증 코드 받기

로그인 프로세스를 시작하려면 웹 브라우저 또는 웹 브라우저 컨트롤을 사용하여 이 URL 요청을 로드합니다.

```jsx
GET <https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}>
```

[필요한 Query String 매개변수](https://www.notion.so/26fd52d01d3e44feb6a3688866ddad57)

- postman으로 입력하지 말고 브라우저에 입력 → URL의 code="..." 복사 (빈 화면에 당황x)
- redirect_uri 얻기
  - https://aka.ms/AppRegistrations/?referrer=https%3A%2F%2Fdev.onedrive.com 접속
  - 개요에서 리디렉션 URI 클릭
  - 플랫폼 추가 클릭 > 웹 선택
  - https://oauth.pstmn.io/v1/callback입력 (postman을 사용하는 경우)

1. 액세스 토큰용 코드 사용

```jsx
POST <https://login.microsoftonline.com/common/oauth2/token>
Content-Type: application/x-www-form-urlencoded

client_id={client_id}&redirect_uri={redirect_uri}&client_secret={client_secret}
&code={code}&grant_type=authorization_code&resource={resource_id}
```

[필요한 Request Body 매개변수](https://www.notion.so/a4d9e79065114b09964031e5b7c8d7a4)

- 에러
  - AADSTS900144: The request body must contain the following parameter: 'grant_type'. → grant_type 값을 넣어줘야함. authorization_code로 고정.
  - AADSTS7000215: Invalid client secret is provided. → https://aka.ms/AppRegistrations/?referrer=https%3A%2F%2Fdev.onedrive.com 접속 → 개요에서 클라이언트 자격 증명 클릭 → 클라이언트 암호 생성 (값은 이후에 블러처리 되니 값 저장 !) → 해당 암호 값 입력
  - AADSTS70008: The provided authorization code or refresh token has expired due to inactivity. Send a new interactive authorization request for this user and resource. → 1번 단계 다시 수행, code value 다시 복사 **(엄청 자주 발생)**
  - AADSTS9002326: Cross-origin token redemption is permitted only for the 'Single-Page Application' client-type. → 1번 단계에서 redirect_uri를 https://oauth.pstmn.io/v1/callback로 수정 (postman을 사용하는 경우) → 다시 code value 복사
  - AADSTS500011: The resource principal named Ea_3ho82AUhNqAgQXEtkzsgBEMd6AnW5jqsV_idrXS1HMg was not found in the tenant named 260c4dc8-45cf-4313-b622-6a388be8632c. This can happen if the application has not been installed by the administrator of the tenant or consented to by any user in the tenant. You might have sent your authentication request to the wrong tenant. → resource의 경로 문제가 있음. 여러 시도를 해봤지만 아직 해결하지 못함. → resource의 값을 https://api.office.com/discovery/로 설정 (고정)

### Node-RED 사용

- 에러
  - InvalidAuthenticationToken CompactToken parsing failed with error code: 80049217 → "Bearer " 주의
  - InvalidAuthenticationToken Access token validation failure. Invalid audience. → **`Azure Active Directory전용 토큰을 발급했었음...(~~미친~~) Microsoft Graph 토큰 발급 시도`**

<br>

## Microsoft Graph (이게 진짜)
### Step 1. Get an authorization code

```jsx
GET <https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={client_id}&scope={scope}>
  &response_type=code&redirect_uri={redirect_uri}
<https://myapp.com/auth-redirect?code=df6aa589-1080-b241-b410-c4dff65dbf7c>
```

[Required query string parameters](https://www.notion.so/060b7e4e5c0c491fae290c14b495bcb0)

- 시행착오
  - AADSTS50194: Application 'c7ce4903-5987-44dc-8ad4-83b343f3a521'(heung's drive) is not configured as a multi-tenant application. Usage of the /common endpoint is not supported for such applications created after '10/15/2018'. Use a tenant-specific endpoint or configure the application to be multi-tenant. → https://login.microsoftonline.com/**common**/oauth2/v2.0/authorize?client_id=c7ce4903-5987-44dc-8ad4-83b343f3a521&scope=files.read files.readwrite&response_type=code&redirect_uri=https://oauth.pstmn.io/v1/callback → common을 테넌트 ID로 변경

### Step 2. Redeem the code for access tokens

```jsx
POST <https://login.microsoftonline.com/common/oauth2/v2.0/token>
Content-Type: application/x-www-form-urlencoded

client_id={client_id}&redirect_uri={redirect_uri}&client_secret={client_secret}
&code={code}&grant_type=authorization_code
{
  "token_type":"bearer",
  "expires_in": 3600,
  "scope":"wl.basic onedrive.readwrite",
  "access_token":"EwCo...AA==",
  "refresh_token":"eyJh...9323"
}
```

[Required request body parameters](https://www.notion.so/8ec501d8829e41b2af168a4c7117c35c)

- 시행착오
  - AADSTS7000215: Invalid client secret is provided. → 클라이언트 암호의 secret ID가 아닌 value 입력
  - AADSTS50194: Application 'c7ce4903-5987-44dc-8ad4-83b343f3a521'(heung's drive) is not configured as a multi-tenant application. Usage of the /common endpoint is not supported for such applications created after '10/15/2018'. Use a tenant-specific endpoint or configure the application to be multi-tenant. → 위와 동일

### Step 3. Get Item ID

```jsx
GET <https://graph.microsoft.com/v1.0/me/drive/root:{file-path}>
Authorization: {access_token}
```

- 시행착오
  - itemNotFound → 파일 경로 확인 ex) 내 파일 가장 상위 폴더에 있을 때 ex) :/fruit.csv
  - InvalidAuthenticationToken, CompactToken parsing failed with error code: 80049217 → 요청 헤더의 Authorization 값에 "Bearer " 붙이지 말아야 함

### Step 4. Node-RED 입력

- 시행착오
  - itemNotFound → step 3으로.
  - InvalidAuthenticationToken, Access token has expired or is not yet valid. → 액세스 토큰 재발급. step1부터 다시 수행
  - BadRequest, Write requests (excluding DELETE) must contain the Content-Type header declaration. → Content-Type : text/plain 입력
  - BadRequest, Entity only allows writes with a JSON Content-Type header. → 경로 설정 제대로. ex) https://graph.microsoft.com/v1.0/me/drive/items/root:/tmp/new.csv:/content
  - 에러는 안나는데 파일 업로드가 안되는 현상... → 코드 수정 완료

<br>

## 기존 OneDrive 노드
mrvik/node-red-contrib-onedrive

### download file

> 드라이브의 파일 다운로드

```jsx
const oneDriveAPI=require("onedrive-api").items
const fs=require("fs")

module.exports=RED=>{
    function DownloadFileNode(config){
        RED.nodes.createNode(this, config)
        const credentials=this.credentials || {}
        this.on("input", msg=>{
            const params={
                accessToken: credentials.AccessToken,
                itemId: config.ItemID || msg.itemID
            }
            const item=oneDriveAPI.download(params)
            const writeStream=fs.createWriteStream(config.Filename || msg.filename)
            item.pipe(writeStream) // 파일 쓰기
            item.on("end", ()=>{
                this.send(msg) // 파일 쓰기 완료 시 다음 노드로 send
            })
            item.on("error", err=>{
                throw err
            })
        })
    }
    RED.nodes.registerType("onedrive-download-file", DownloadFileNode, {
        credentials: {
            AccessToken: {
                type: "text",
            },
        },
    })
}
```

### upload file

> 로컬의 파일 업로드

```jsx
const oneDriveAPI=require("onedrive-api").items

module.exports=RED=>{
    function UploadFileNode(config){
        RED.nodes.createNode(this, config)
        const credentials=this.credentials || {}
        this.on("input", msg=>{
            const params={
                accessToken: credentials.AccessToken || config.AccessToken,
                filename: msg.filename || config.Filename,
                parentPath: msg.parentPath || config.ParentPath,
                readableStream: msg.payload,
            }
            oneDriveAPI.uploadSimple(params).then(item=>{
                msg.upload=item
                this.send(msg)
            }).catch(e=>{
                msg={
                    ...msg,
                    ...e,
                }
                this.send(msg)
            })
        })
    }
    RED.nodes.registerType("onedrive-upload-file", UploadFileNode, {
        credentials: {
            AccessToken: {
                type: "text",
            },
        },
    })
}
```

### readable stream

> 로컬의 파일 읽기

```jsx
const fs=require("fs")
module.exports=RED=>{
    function CreateReadableStream(config){
        RED.nodes.createNode(this, config)
        this.on("input", msg=>{
            msg.payload=fs.createReadStream(msg.filename || config.filename)
            msg.payload.on("error", console.error)
            this.send(msg)
        })
    }
    RED.nodes.registerType("create-readable-stream", CreateReadableStream)
}
```
