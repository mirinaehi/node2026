import express from "express";
import cors from "cors";

const app = express();

// 프런트엔드와 API 서버의 포트가 다르므로 3000번 출처의 요청을 허용합니다.
// 주석을 해제하세요.
// app.use(cors({
//   origin: "http://localhost:3000"
// }));

// 실제 데이터베이스 대신 서버가 가지고 있는 프로젝트 데이터를 사용합니다.
const dashboard = {
  company: "NOVA Studio",
  summary: [
    { label: "진행 중 프로젝트", value: 8, unit: "개", change: "+2 이번 달" },
    { label: "전체 팀원", value: 24, unit: "명", change: "+3 이번 달" },
    { label: "평균 진행률", value: 74, unit: "%", change: "+8% 지난주 대비" },
    { label: "이번 달 매출", value: 12840, unit: "만원", change: "+12.4% 지난달 대비" }
  ],
  projects: [
    {
      id: "PRJ-1042",
      name: "모바일 뱅킹 앱 리뉴얼",
      client: "한빛은행",
      manager: "김서연",
      status: "진행 중",
      progress: 82,
      budget: 9200,
      deadline: "2026-12-18"
    },
    {
      id: "PRJ-1038",
      name: "글로벌 쇼핑몰 구축",
      client: "Morrow Commerce",
      manager: "이도윤",
      status: "검토 중",
      progress: 64,
      budget: 7600,
      deadline: "2027-01-09"
    },
    {
      id: "PRJ-1035",
      name: "사내 데이터 대시보드",
      client: "NOVA Studio",
      manager: "박지우",
      status: "진행 중",
      progress: 47,
      budget: 4800,
      deadline: "2027-01-24"
    },
    {
      id: "PRJ-1029",
      name: "브랜드 웹사이트 개편",
      client: "Atelier Nine",
      manager: "최민준",
      status: "완료",
      progress: 100,
      budget: 3500,
      deadline: "2026-11-20"
    }
  ]
};

app.get("/", (req, res) => {
  res.send("NOVA API 서버입니다. /api/dashboard에서 데이터를 확인할 수 있습니다.");
});

app.get("/api/dashboard", (req, res) => {
  res.json({
    ...dashboard,
    updatedAt: new Date().toLocaleString("ko-KR")
  });
});

app.listen(4000, () => {
  console.log("API server: http://localhost:4000");
});
