# ft_transcendence
메인 레포지토리입니다.

# git branch
main : 최종적으로 코드 적용할 브랜치 입니다.
<br>dev : 추가 기능 테스트 전에 merge할 브랜치 입니다.
<br><br>
추가 기능 구현하실때 Jira에 있는 branch 추가 명령 입력해서 해당 branch에서 기능 추가해주시고, dev브랜치에 merge하는 방법으로 추가해주세요

# commit convention
- commit의 기준 : commit은 아래 커밋 타입에 맞게 commit들을 분리한다.
- commit은 되도록이면, 기능 단위로 세분화하여서 짧게 사용하고 pull request 머지 시킨다.
- pull request 는 가능한 '2명' 이상의 review 후 merge 가 가능하다. 이때는 review 후 브랜치를 삭제한다.
- 그러나 부득이 바쁜 경우, 혹은 해당 구현 사항이 당장 필요하여 부득이 origin 브랜치에 merge가 되어야 하는 경우 강제 merge 후 브랜치를 **삭제하지 않는다.** 이후 review 시간에 이 내용에 대해 반드시 review 후 해당 pull request 를 삭제한다.
- commit message 작성 시(풀 리퀘스트시 merge mesaage 작성 포함) footer에 관련 issue, PR로 이어지는 링크 정보를 포함해서 작성

## commit의 타입

- **FEAT**: 기능을 추가 또는 수정
- **FIX**: 버그를 해결
- **DOCS**: 문서를 수정 (README.md 변경, swagger)
- **STYLE**: 코드 스타일 변경 (prettier, npm run lint 등)
- **REFACT**: 코드를 리팩토링, 기능은 같고 코드가 변경
- **TEST**: 테스트 코드를 추가 또는 수정
- **MERGE**: 풀 리퀘스트 머지할 경우
- **CHORE**: 폴더 구조 변경, Makefile수정 등과 같이 빌드 관련 정보 수정
- **WIP**: working in process 아직 작업중인 내용

## commit 예시

```jsx
[FIX]: 모델 validation 오류 수정
- Book title 제목 default 값 추가
- User intra 최소 길이 0으로 변경
#12
```

```jsx
[FEAT]: 로그인 기능 추가
- auth/ api 추가
#5
```

```jsx
[TEST]: bookController 테스트 코드 추가
- 책 제목에 대한 유효성 테스트 추가
#8
```


# npm install backend
npm install @nestjs/websockets
npm install socket.io
npm install @nestjs/platform-socket.io

# npm install frontend
socket.io-client
