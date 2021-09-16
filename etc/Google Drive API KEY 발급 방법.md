# Google Drive API KEY 발급 방법

> Google Drive API를 활용해서 Download, Upload를 하기위해 아래의 요소들이 필요하다.
>
> - Client ID
> - Client Secret Key
> - Refresh Token



### Client ID & Client Secret Key 

- `https://console.cloud.google.com/`에서 새로운 프로젝트를 생성 후에 생성한 프로젝트로 이동한다.
- 왼쪽 메뉴에서 API 및 서비스로 이동한다.
- API 및 서비스의 왼쪽 메뉴 중 라이브러리로 이동하여 google drive를 검색하여 google drive api를 사용하기로 변경한다.
- API 및 서비스의 메뉴에서 사용자 인증 정보로 이동하여 상단에 사용자 인증 정보 만들기를 클릭하여 OAuth 클라이언트 ID를 만든다.
- 동의화면 구성 페이지에서 User Type을 외부로 선택하고 만든다.
- 다시 사용자 인증 정보에서 OAuth 클라이언트 ID 만들기 버튼을 눌러서 어플리케이션 유형을 `웹 클라이언트`로 클릭한다.
- 리다이렉션 URI는 `https://developers.google.com/oauthplayground`로 입력하고 만들기 버튼을 누른다.
- 사용자 인증 정보에 출력되는 OAuth 2.0 클라이언트 ID에서 생성한 정보를 클릭하여 Client ID와 Client Secret을 확인한다.



### Refresh Token

- `https://developers.google.com/oauthplayground`로 이동한다.
- API 목록 중 `Drive API v3`을 클릭한다.
- 출력되는 URL 중 가장 첫 번째에 있는 `https://www.googleapis.com/auth/drive`를 클릭하고 Authorize APIs를 클릭한다.
- 이후 구글 계정으로 로그인하여 모든 접근을 허용한다.
- 마지막으로 Step2에서 파란색 버튼을 클릭하면 Refresh Token을 확인할 수 있을 것이다.

