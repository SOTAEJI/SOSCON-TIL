# SOSCON-TIL
삼성 소프트웨어 개발자 컨퍼런스 2021 프로그램 세션<br>
Samsung Automation Studio를 활용한 Flow 및 Node 개발에 참여하기

<br>

## 1. Branch Convention
#### 1) Branch Tree
```
ssafy-5th
     └──develop
         └──feature/formatting 
            └──feature/xml#24 (예시)
         └──feature/drive
            └──feature/one#26 (예시)
```
#### 2) Branch Naming Convetion
1. 개발하는 기능 별로 Branch를 분기시킨다. 
2. 분기되는 브랜치 명은 다음과 같이 짓는다. `feature/개발기능#Jira이슈번호`

<br>

## 2. Commit Message Convention
#### 1) Commit Message Prefix
```
types = {      
	feat: 새로운 기능에 대한 커밋      
	fix: 버그 수정에 대한 커밋      
	build: 빌드 관련 파일 수정에 대한 커밋      
	chore: 그 외 자잘한 수정에 대한 커밋      
	ci: CI관련 설정 수정에 대한 커밋      
	docs: 문서 수정에 대한 커밋      
	style: 코드 스타일 혹은 포맷 등에 관한 커밋      
	refactor:  코드 리팩토링에 대한 커밋      
	test: 테스트 코드 수정에 대한 커밋   
}
```
#### 2) Commit Message 
    1. 제목은 동사 원형으로 시작
    2. 총 글자 수는 50자 이내로 작성
    3. 마지막에 특수문자는 삽입하지 않는다(마침표, 느낌표, 물음표 등)
    4. 영어로 작성하며 첫 글자는 소문자로 작성한다. 

<br>

## 3. GitHub & Jira 연동
- 프로젝트 명과 이슈 명을 같이 표기한다.
- ex) git commit -m "feat: add xml formatter #S05P67S125-54"

<br>

## 4. Jira Convention
    1. Sprint 단위 : 매주 월 AM 9:00 ~ 금 PM 6:00
    2. Sprint 이름 : N주차
    3. Issue Type : 
        1. Epic : 사전학습, 기획, 개발, 발표준비 etc…
        2. Story : 개발할 큰 주제 ex) 원드라이브 개발 -> Git 브랜치 이름 : feature/drive/one#36
        3. Subtask : 개발할 주제 하위 테스크에 구체적 개발 내용 ex) 원드라이브 Access Key 발급 -> Git commit message: #S05P21005-37
        4. Task : 개발 외의 문서 작업, 발표 준비, etc 

<br>

## 5. Daily Scrum 
    1. 아침 회의 : AM 10 미팅 종료 후 10분 
    2. 오후 회의 : PM 4 ~ 5

<br>
    

    
