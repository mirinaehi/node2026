# 07. 모듈 처리만 보기

이번 예제는 일부러 기능을 단순하게 유지합니다.

목표는 두 가지입니다.

- Node.js 기본 `require()`와 `module.exports` 이해하기
- Node.js ES Module의 `import`와 `export` 이해하기

## 폴더 구성

```text
07-modules-only/
  commonjs-require/
    app.js
    greeting.js
    calculator.js
    userProfile.js
  esmodule-import/
    package.json
    app.js
    greeting.js
    calculator.js
    userProfile.js
```

## 1. CommonJS require 예제

```powershell
cd C:\dev\node2026\07-modules-only\commonjs-require
node app.js
```

관찰할 코드:

- `greeting.js`는 함수 하나를 `module.exports`로 내보냅니다.
- `calculator.js`는 여러 함수를 객체로 묶어 `module.exports`로 내보냅니다.
- `userProfile.js`는 프로필 객체, 기본 프로필, 프로필 배열, 조회 함수를 묶어 `module.exports`로 내보냅니다.
- `app.js`는 `require()` 결과에서 필요한 값과 함수만 구조 분해합니다.

## 2. ES Module import 예제

```powershell
cd C:\dev\node2026\07-modules-only\esmodule-import
node app.js
```

관찰할 코드:

- `package.json`에 `"type": "module"`이 있습니다.
- `greeting.js`는 함수 하나를 `export default`로 내보냅니다.
- `calculator.js`는 여러 함수를 `export function`으로 내보냅니다.
- `userProfile.js`는 큰 객체를 만든 뒤 기본값, 배열, 조회 함수를 각각 `export`로 내보냅니다.
- `app.js`는 `import { ... }`로 필요한 값과 함수만 가져와 사용합니다.

## 비교 포인트

CommonJS 방식:

```js
const createGreeting = require("./greeting");
const { add, multiply } = require("./calculator");
const {
  DEFAULT_USER_PROFILE,
  introduce,
  resolveUserProfile,
  userProfiles,
} = require("./userProfile");
```

ES Module 방식:

```js
import createGreeting from "./greeting.js";
import { add, multiply } from "./calculator.js";
import {
  DEFAULT_USER_PROFILE,
  introduce,
  resolveUserProfile,
  userProfiles,
} from "./userProfile.js";
```

처음에는 이 차이만 보면 충분합니다.

- CommonJS는 Node.js에서 오래 쓰인 방식입니다.
- ES Module은 최신 JavaScript 표준 방식입니다.
- ES Module에서는 로컬 파일을 import할 때 `.js` 확장자를 붙이는 습관을 들이면 좋습니다.
- 큰 객체를 만들고, 그 객체에서 파생된 값이나 함수만 골라 가져오면 코드의 의도가 더 분명해집니다.

ES Module의 `userProfile.js`는 아래 흐름을 보여줍니다.

```js
export const USER_PROFILES = {
  jin: {
    id: "jin",
    name: "Jin",
  },
};

export const DEFAULT_USER_PROFILE = USER_PROFILES.jin;
export const userProfiles = Object.values(USER_PROFILES);
export const resolveUserProfile = (profileId) =>
  USER_PROFILES[profileId] ?? DEFAULT_USER_PROFILE;
```

그리고 사용하는 쪽에서는 필요한 이름만 가져옵니다.

```js
import {
  DEFAULT_USER_PROFILE,
  resolveUserProfile,
} from "./userProfile.js";
```
