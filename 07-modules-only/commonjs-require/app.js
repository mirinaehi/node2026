const createGreeting = require("./greeting");
const { add, multiply } = require("./calculator");
const {
  DEFAULT_USER_PROFILE,
  introduce,
  resolveUserProfile,
  userProfiles,
} = require("./userProfile");

const name = "Jin";
const left = 10;
const right = 5;

console.log(createGreeting(name));
console.log(`${left} + ${right} = ${add(left, right)}`);
console.log(`${left} * ${right} = ${multiply(left, right)}`);
console.log(`등록된 프로필 수: ${userProfiles.length}`);
console.log(introduce(DEFAULT_USER_PROFILE));
console.log(introduce(resolveUserProfile("mina")));
