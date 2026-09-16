import { Router } from "express";

const router = Router();

const users = [
  { id: 1, name: "Jin", role: "backend learner" },
  { id: 2, name: "Mina", role: "frontend learner" },
  { id: 3, name: "Hyun", role: "fullstack learner" },
];

router.get("/", (req, res) => {
  res.json({
    router: "users",
    count: users.length,
    data: users,
  });
});

router.get("/:id", (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find((item) => item.id === userId);

  if (!user) {
    res.status(404).json({
      message: `${userId}번 사용자를 찾을 수 없습니다.`,
    });
    return;
  }

  res.json({
    router: "users",
    data: user,
  });
});

export default router;

