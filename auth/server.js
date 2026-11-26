import express from "express";
import { randomUUID } from "node:crypto";

const app = express();
const sessions = new Map();

// 학습용 계정입니다. 실제 서비스에서는 비밀번호를 암호화해서 데이터베이스에 저장합니다.
const users = {
  employee: { password: "1234", name: "김사원", role: "employee" },
  admin: { password: "admin1234", name: "박관리자", role: "admin" }
};

app.use(express.json());
app.use(express.static("./public"));

// 인증: 요청을 보낸 사용자가 누구인지 확인합니다.
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const user = sessions.get(token);

  if (!user) {
    return res.status(401).json({ message: "인증 실패: 먼저 로그인해 주세요." });
  }

  req.user = user;
  req.token = token;
  next();
}

// 인가: 인증된 사용자가 관리자 기능을 사용할 권한이 있는지 확인합니다.
function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "인가 실패: 관리자 권한이 필요합니다." });
  }

  next();
}

app.post("/api/login", (req, res) => {
  const { id, password } = req.body;
  const user = users[id];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 다릅니다." });
  }

  const token = randomUUID();
  const loginUser = { id, name: user.name, role: user.role };
  sessions.set(token, loginUser);

  res.json({
    message: `${user.name}님, 인증에 성공했습니다.`,
    token,
    user: loginUser
  });
});

// 로그인한 사용자라면 역할과 관계없이 접근할 수 있습니다.
app.get("/api/profile", authenticate, (req, res) => {
  res.json({
    message: "인증된 사용자의 정보입니다.",
    user: req.user
  });
});

// 먼저 인증하고, 이어서 관리자 권한까지 확인합니다.
app.get("/api/admin/report", authenticate, authorizeAdmin, (req, res) => {
  res.json({
    message: "관리자 전용 보고서입니다.",
    report: {
      monthlyRevenue: "128,400,000원",
      activeMembers: 2847,
      pendingApprovals: 12
    }
  });
});

app.post("/api/logout", authenticate, (req, res) => {
  sessions.delete(req.token);
  res.json({ message: "로그아웃했습니다." });
});

app.listen(3100, () => {
  console.log("Server: http://localhost:3100");
});
