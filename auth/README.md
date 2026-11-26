# 인증과 인가 예제

로그인으로 사용자의 신원을 확인하는 **인증**과, 인증된 사용자의 역할을 확인하는 **인가**를 비교하는 프로젝트입니다.

## 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3100`에 접속합니다.

## 예제 계정

| 구분 | 아이디 | 비밀번호 | 역할 |
| --- | --- | --- | --- |
| 일반 사용자 | `employee` | `1234` | `employee` |
| 관리자 | `admin` | `admin1234` | `admin` |

## 확인 순서

1. 로그인하지 않고 `내 정보 요청`을 누르면 인증 실패인 `401`이 나옵니다.
2. 일반 사용자로 로그인하면 내 정보는 볼 수 있습니다.
3. 일반 사용자가 관리자 보고서를 요청하면 인가 실패인 `403`이 나옵니다.
4. 관리자로 로그인하면 관리자 보고서를 볼 수 있습니다.

## 핵심 구조

```js
app.get("/api/profile", authenticate, profile);
app.get("/api/admin/report", authenticate, authorizeAdmin, adminReport);
```

- `authenticate`: 로그인한 사용자인지 확인합니다.
- `authorizeAdmin`: 인증된 사용자가 관리자인지 확인합니다.
