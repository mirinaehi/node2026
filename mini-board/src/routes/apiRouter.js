import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import postsRouter from "./postsRouter.js";

const apiRouter = Router();

apiRouter.get("/health", getHealth);

// app.js의 /api와 여기의 /posts가 합쳐져 최종 경로는 /api/posts가 됩니다.
apiRouter.use("/posts", postsRouter);

export default apiRouter;
