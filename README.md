# redbrick-subject

## 게임 퍼블리싱 서비스를 위한 API 구현

## 서비스 

https://blooming-reaches-88618.herokuapp.com

## API 문서

https://documenter.getpostman.com/view/18183669/UVJfjFYb

## 제출 기업 정보

- 기업명 : redbricks
- 주요 서비스 사이트: [WizLab(위즈랩)](http://www.wizlab.net/)

## 요구 사항

- 회원가입
- 게임 제작 API
  - 프로젝트는 실시간으로 반영이 되어야 합니다
    - 프로젝트 수정 중 의도치 않은 사이트 종료 시에도 작업 내역은 보존되어야 합니다
  - 게임 CRUD
  - 조회수 조작 API
  - 좋아요 API
  - 게임명/사용자명으로 게임 검색
- 게임 출시하기(퍼블리싱)
  - **프로젝트 당 퍼블리싱 할 수 있는 개수는 하나**입니다.
  - 퍼블리싱한 게임은 수정할 수 있어야 하며, 수정 후 재출시시 기존에 퍼블리싱된 게임도 수정됩니다
  - 출시하는 게임은 다른 사용자들도 볼 수 있으며, 사용자들의 **조회수 / 좋아요 등을 기록**할 수 있어야 합니다
  - '게임 혹은 사용자 **검색**'을 통해서 찾을 수 있어야 합니다

## 조원

| 이름   | 외부링크                                                                                                                                        | 담당 기능                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **신영학** | **[깃허브](https://github.com/yhshin0)/[블로그](https://nbkw.tistory.com/)**                                                                        | **프로젝트 테이블 CRUD, 게임 검색, 게임 퍼블리싱, 유닛 테스트, 리팩토링** |
| 이현준(조장) | [깃허브](https://github.com/lhj0621)/[블로그](https://supiz.tistory.com/)                                                                       | 총괄, 게임 CRUD, 프로젝트 실시간 저장 기능, 헤로쿠 배포     |
| 김태련 | [깃허브](https://github.com/nojamcode)/[블로그](https://velog.io/@code-link)                                                                    | 유저 수정, 로그인, 로그인 인증, 유닛테스트                  |
| 임유라 | [깃허브](https://github.com/BangleCoding)/[블로그](https://banglecoding.github.io/)                                                             | 유저 생성, 로그아웃, 유닛 테스트, README 작성               |
| 이기범 | [깃허브](https://github.com/gibson-lee93)/[블로그](https://mysterious-laborer-518.notion.site/Gibson-s-Notion-2dd7f598fba64f1c9806cded5b4b83a0) | 게임 CRUD, 게임 좋아요 기능, 유닛 테스트                    |
| 정진산 | [깃허브](https://github.com/chinsanchung)/[블로그](https://chinsanchung.github.io/)                                                             | 프로젝트 테이블 CRUD, 게임 검색, 게임 퍼블리싱, 유닛 테스트 |

## 개발 환경

- 언어: TypeScript
- 프레임워크: NestJs
- 데이터베이스: SQLite3
- 라이브러리: typeorm, passport, passport-jwt, bcrypt, class-validator, class-transformer, cache-manager, schedule
- 배포 환경: Heroku

## ERD

![레드브릭데이터베이스 ERD](https://user-images.githubusercontent.com/51621520/144440332-019b1743-1380-4570-8a15-4c2aa266a9da.png)

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
- 목록 조회, 생성, 업데이트, 삭제 시 JWT를 필요로 합니다.
- 프로젝트 목록 조회는 페이지네이션을 이용해 한 페이지에 5개씩 출력합니다. 또한 로그인한 유저 자신이 작성한 프로젝트만 조회할 수 있습니다.
- project의 update, delete는 작성자만이 수행할 수 있습니다. 작성자가 아닌 경우 401 상태코드를 반환합니다.

### 프로젝트 : 실시간 반영

- 프로젝트 작성 시 실시간으로 수정을 반영하는 로직을 개발했습니다.
- 요청마다 수정 반영 시 서버 부하가 발생할 것으로 예상하여 cache, schedule 사용하였습니다.
- cache-manager을 이용하여 서버에 데이터를 임시 저장합니다.
- schedule을 이용하여 마지막 요청 후 60초 후에 임시 저장한 데이터를 반영합니다.

### 프로젝트 : 퍼블리싱

- 프로젝트를 게임으로 퍼블리싱하는 로직을 개발했습니다.
- 프로젝트와 게임 서비스가 순환 참조되는 현상을 방지하기 위해 `forwardRef`를 사용했습니다.
- typeorm 의 `softDelete` 메소드를 이용해 데이터를 실제로 삭제하지 않도록 구현했습니다.

### 게임

- 게임의 CRUD를 구현했습니다. API를 수행하기 전에 로그인을 했는지 확인합니다.
- 게임 전체 조회시 페이지네이션을 이용해 한 페이지당 5개의 게임 목록을 출력합니다.
- 게임을 전체 조회할 때와 상세 조회할 때, 좋아요 숫자와 리스트가 출력됩니다.
- 게임을 상세 조회할 경우 조회 수가 증가합니다.
- 유저는 하나의 게임을 한 번만 좋아요 할 수 있습니다.
- 좋아요 했던 게임을 취소하는 것이 가능합니다.
- 유저의 nickname 이나 game의 title로 게임을 검색할 수 있도록 구현했습니다. 목록으로 출력하며, 페이지네이션으로 한 페이지당 5개씩 출력합니다.

### Architecture

![redbrick-architecture](https://user-images.githubusercontent.com/51621520/144440642-76fa3636-c787-4c9c-82d7-2ed6cb869440.png)

1. 클라이언트에서 프로젝트 수정 화면에 들어가면 프로젝트의 데이터를 특정 공간(ex: Local Storage)에 저장
1. 클라이언트에서 프로젝트를 수정할 때 특정 공간에 있는 값과 특정 시간마다 비교하여 다르면 서버에게 프로젝트 업데이트 요청
1. 서버는 업데이트 요청을 받은 데이터를 cache에 저장 후, cache에 저장한 값을 클라이언트에게 응답으로 반환
1. 서버에서 클라이언트 업데이트 요청이 특정 시간(ex: 60s) 동안 없다면 가장 최근에 cache에 저장했던 값을 DB에 저장

## 실행 방법

1. `git clone` 명령어로 프로젝트 파일을 가져옵니다.

2. `npm install` 명령으로 서버 실행에 필요한 패키지를 설치합니다.

3. `npm build` 명령으로 프로젝트를 빌드합니다.

4. `.env` 파일을 작성하여 `dist` 폴더로 이동시킵니다. 해당 파일에는 `PORT`(실행시킬 PORT 값), `JWT_SECRET`(jwt secret 값)을 정의합니다.

	.env

	```
	PORT=3000
	JWT_SECRET=1q2w3e4r
	```

	또는 PORT, JWT_SECRET을 환경변수로 등록합니다.

	```
	$ export PORT=3000
	$ export JWT_SECRET=1q2w3e4r
	```

5. `npm run start:prod` 명령어로 서버를 실행시킵니다.

	```
	$ npm run start:prod
	```

## 폴더 구조

```bash
.
├── .env
├── .eslintrc.js
├── .github
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── .prettierrc
├── Procfile
├── README.md
├── nest-cli.json
├── package-lock.json
├── package.json
├── redbrick.db
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   ├── auth.constants.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── dto
│   │   │   └── login-user.dto.ts
│   │   ├── get-user.decorator.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── cache
│   │   ├── cache.constants.ts
│   │   ├── cache.module.ts
│   │   └── cache.service.ts
│   ├── core
│   │   └── entities
│   │       └── core.entity.ts
│   ├── game
│   │   ├── dto
│   │   │   ├── create-game.dto.ts
│   │   │   └── update-game.dto.ts
│   │   ├── entities
│   │   │   └── game.entity.ts
│   │   ├── game.constants.ts
│   │   ├── game.controller.ts
│   │   ├── game.module.ts
│   │   ├── game.repository.ts
│   │   ├── game.service.spec.ts
│   │   └── game.service.ts
│   ├── main.ts
│   ├── projects
│   │   ├── dto
│   │   │   ├── create-project.dto.ts
│   │   │   ├── publish-project.dto.ts
│   │   │   └── update-project.dto.ts
│   │   ├── entities
│   │   │   └── project.entity.ts
│   │   ├── projects.constants.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.interface.ts
│   │   ├── projects.module.ts
│   │   ├── projects.service.spec.ts
│   │   └── projects.service.ts
│   └── users
│       ├── dto
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── entities
│       │   └── user.entity.ts
│       ├── user.constants.ts
│       ├── user.service.spec.ts
│       ├── users.controller.spec.ts
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

```
