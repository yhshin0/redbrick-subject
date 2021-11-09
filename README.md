
# redbrick-subject

  
원티드x위코드 백엔드 프리온보딩 3번째 과제입니다.
  

## 제출 기업 정보

- 기업명 : redbricks
- 주요 서비스 사이트: [WizLab(위즈랩)](http://www.wizlab.net/)


## 과제 : WizLab(위즈랩) 게임 퍼블리싱 서비스

- 학생들에게 코딩의 재미를 느낄 수 있게 간단한 게임을 코딩을 통해 만들 수 있는 플랫폼 개발 

### [필수 요구 사항]

-   회원가입
-   게임 제작
    -   프로젝트는 실시간으로 반영이 되어야 합니다
        -   프로젝트 수정 중 의도치 않은 사이트 종료 시에도 작업 내역은 보존되어야 합니다
-   게임 출시하기
    -   **프로젝트 당 퍼블리싱 할 수 있는 개수는 하나**입니다. 
    - 퍼블리싱한 게임은 수정할 수 있어야 하며, 수정 후 재출시시 기존에 퍼블리싱된 게임도 수정됩니다
    -   출시하는 게임은 다른 사용자들도 볼 수 있으며, 사용자들의 **조회수 / 좋아요 등을 기록**할 수 있어야 합니다
    -   '게임 혹은 사용자 **검색**'을 통해서 찾을 수 있어야 합니다

### [개발 요구사항]

**아래의 문제를 풀어야 합니다.**
```jsx
- 참고 - 문제 1,2번은 필수 문제이며, 3번은 선택입니다
문제 1. '회원가입'부터 '게임 출시'까지 필요한 테이블을 설계하세요

문제 2. 다음에 필요한 API를 설계하세요

	1) 게임 제작 API
	2) 조회수 수정, 좋아요 API
	3) 게임/사용자 검색 API

- option -
문제 3. 
 (1) 프로젝트 실시간 반영을 위한 Architecture를 설계하세요 ( 그림이 있다면 좋습니다 )
 (2) 위의 Architecture를 토대로 기능을 구현하세요
```

### [평가 요소]

- 주어진 요구사항에 대한 설계/구현 능력
- 코드로 동료를 배려할 수 있는 구성 능력 (코드, 주석, README 등)
- 유닛 테스트 구현 능력



## 조원

  | 이름   | 외부링크 | 담당 기능                                             |
| ------ | ----------------------------------------------- | ----------------------------------------------------- |
| 이현준 | [깃허브](https://github.com/lhj0621)/[블로그](https://supiz.tistory.com/)      |  총괄, 게임 CRUD, 프로젝트 실시간 저장 기능, 헤로쿠 배포   |
| 김태련 | [깃허브](https://github.com/nojamcode)/[블로그](https://velog.io/@code-link)     | 유저 수정, 로그인, 로그인 인증, 유닛테스트 |
| 신영학 | [깃허브](https://github.com/yhshin0)/[블로그](https://nbkw.tistory.com/) | 프로젝트 테이블 CRUD |
| 임유라 | [깃허브](https://github.com/BangleCoding)/[블로그](https://banglecoding.github.io/)       | 유저 생성, 로그아웃, 유닛 테스트, README 작성 |
| 이기범 | [깃허브](https://github.com/gibson-lee93)/[블로그](https://mysterious-laborer-518.notion.site/Gibson-s-Notion-2dd7f598fba64f1c9806cded5b4b83a0) | 게임 CRUD, 게임 좋아요 기능, 유닛 테스트      |
| 정진산 | [깃허브](https://github.com/chinsanchung)/[블로그](https://chinsanchung.github.io/) | 프로젝트 테이블 CRUD |
  


## 개발 환경
- 언어: TypeScript
- 프레임워크: NestJs
- 데이터베이스: SQLite3
- 라이브러리: typeorm, passport, passport-local, passport-jwt, bcrypt, class-validator
  
## ERD
  ![레드브릭데이터베이스 ERD](https://user-images.githubusercontent.com/47234375/140962281-fd05897c-4839-4036-aac6-f3948ae01519.png)

## 구현 기능


### 회원가입

- bcrypt의 단방향 암호화로 입력받은 비밀번호를 암호화하여 저장했습니다.
- class-validator으로 입력 값의 유효성을 검사해 회원가입에서 발생가능한 오류를 줄였습니다.
- 이메일 중복 체크를 통해 동일한 이메일으로 가입을 하지 않도록 했습니다.

### 로그인, 로그인 인증 및 로그아웃

- passport 으로 로그인 과정에서 보안을 유지합니다.
- 로그인 성공 시 유저 인증을 위한 JWT(Json Web Token)이 발급됩니다. 
- 로그인 시간을 유저의 DB에 기록하는 동시에 JWT 토큰에 저장합니다. 이 정보는 API 호출 시 이전 로그인 시간과 값을 비교하여 토큰의 유효성을 검증하는데 사용합니다.
- 유저 DB 의 로그인 시간을 null 값으로 갱신하여 로그아웃을 수행합니다. 또한 로그인 시 발급받은 토큰을 만료시킵니다.

  
### 프로젝트
- 프로젝트(게임 퍼블리싱 전 단계의, 현재 제작중인 게임) 의 CRUD를 구현했습니다. 
-  프로젝트의 모든 API는 JWT를 필요로 합니다.
-  프로젝트 목록 조회의 경우, 로그인한 유저는 자신이 작성한 프로젝트만 조회할 수 있습니다. 단 findOne의 경우, 작성자와 관계없이 조회가 가능합니다.
- project의 update, delete는 작성자만이 수행할 수 있습니다. 작성자가 아닌 경우 401 상태코드를 반환합니다.

### 프로젝트 : 실시간 반영 
-   프로젝트 작성 시 실시간으로 수정을 반영하는 로직을 개발했습니다. 
- 요청마다 수정 반영 시 서버 부하가 발생할 것으로 예상하여 cache, schedule 사용하였습니다.
-   cache-manager을 이용하여 서버에 데이터를 임시 저장합니다. 
-  schedule을 이용하여 마지막 요청 후 60초 후에 임시 저장한 데이터를 반영합니다. 

### 프로젝트 : 퍼블리싱
- 프로젝트를 게임으로 퍼블리싱하는 로직을 개발했습니다. 
- 프로젝트와 게임 서비스가 순환 참조되는 현상을 방지하기 위해 forwardRef를 사용했습니다. 
- 퍼블리싱 한 게임을 삭제해도 프로젝트는 그대로 남아있습니다. 
- 프로젝트를 삭제해도 퍼블리싱 된 게임은 그대로 남아있습니다. 

### 게임
- 게임의 CRUD를 구현했습니다.  API를 수행하기 전에 로그인을 했는지 확인합니다.
- 게임 전체 조회시 페이지네이션을 이용해 한 페이지당 5개의 게임 목록을 출력합니다. 
- 게임을 전체 조회할 때와 상세 조회할 때, 좋아요 숫자와 리스트가 출력됩니다. 
- 게임을 상세 조회할 경우 조횟수가 증가합니다. 
- 유저는 하나의 게임을 한 번만 좋아요 할 수 있습니다.
- 좋아요 했던 게임을 취소하는 것이 가능합니다.
- 유저의 nickname 이나 game의 title로 게임을 검색할 수 있도록 구현했습니다. 
  


## API 문서

API 테스트를 위한 방법을 [POSTMAN document](https://documenter.getpostman.com/view/15323948/UVC2HpCf)에서 확인하실 수 있습니다.
  
  
## 배포

Heroku를 이용해 배포를 진행했으며, 사이트의 주소는 [http://](http://) 입니다.

**차후 수정 요망 **





## 설치 및 실행 방법

### 공통  

- 1. 최상위 폴더에 `.env` 파일에 `JWT_SECRET`에 임의의 문자열을 작성해 저장합니다.

- 2. `npm install`으로 패키지를 설치합니다.

- 3. 테스트

- 개발일 경우: `npm run start`으로 `localhost:3000`에서 테스트하실 수 있습니다.

- 배포일 경우: `npm run build`으로 애플리케이션을 빌드합니다. 그리고 `npm run start:prod`으로 실행합니다.

- 4. POST `localhost:3000/users`에서 `email`, `password`, `role`("admin" 또는 "user")를 입력해 유저를 생성합니다.

- 5. POST `localhost:3000/auth/login`에 `email`, `password`을 입력하신 후 결과값으로 access_token을 발급받습니다.

- 6. 프로젝트 생성, 퍼블리싱 등 권한이 필요한 API의 주소를 입력한 후, Headers 의 Authorization에 access_token을 붙여넣어 권한을 얻은 후 API를 호출합니다.
  

## 폴더 구조

```bash
|   .eslintrc.js
|   .gitignore
|   .prettierrc
|   nest-cli.json
|   package-lock.json
|   package.json
|   README.md
|   tsconfig.build.json
|   tsconfig.json
|
+---.github
|       PULL_REQUEST_TEMPLATE.md
|
+---src
|   |   app.controller.spec.ts
|   |   app.controller.ts
|   |   app.module.ts
|   |   app.service.ts
|   |   main.ts
|   |
|   +---auth
|   |   |   auth.controller.ts
|   |   |   auth.module.ts
|   |   |   auth.service.ts
|   |   |   get-user.decorator.ts
|   |   |   jwt-auth.guard.ts
|   |   |   jwt.strategy.ts
|   |   |
|   |   \---dto
|   |           login-user.dto.ts
|   |
|   +---cache
|   |       cache.module.ts
|   |       cache.service.ts
|   |
|   +---core
|   |   \---entities
|   |           core.entity.ts
|   |
|   +---game
|   |   |   game.controller.ts
|   |   |   game.module.ts
|   |   |   game.repository.ts
|   |   |   game.service.ts
|   |   |
|   |   +---dto
|   |   |       create-game.dto.ts
|   |   |       update-game.dto.ts
|   |   |
|   |   \---entities
|   |           game.entity.ts
|   |
|   +---projects
|   |   |   projects.controller.ts
|   |   |   projects.interface.ts
|   |   |   projects.module.ts
|   |   |   projects.service.ts
|   |   |
|   |   +---dto
|   |   |       create-project.dto.ts
|   |   |       publish-project.dto.ts
|   |   |       update-project.dto.ts
|   |   |
|   |   \---entities
|   |           project.entity.ts
|   |
|   \---users
|       |   users.controller.ts
|       |   users.module.ts
|       |   users.service.ts
|       |
|       +---dto
|       |       create-user.dto.ts
|       |       update-user.dto.ts
|       |
|       \---entities
|               user.entity.ts
|
\---test
        app.e2e-spec.ts
        jest-e2e.json
```