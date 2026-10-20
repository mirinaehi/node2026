import { Router } from "express";
import { createPost, getPost, getPosts } from "../controllers/postsController.js";
import validatePostInput from "../middleware/validatePostInput.js";

const postsRouter = Router();

// 상위 라우터가 /api/posts를 담당하므로 여기서는 그 뒤의 경로만 작성합니다.
postsRouter.get("/", getPosts);

// :id는 게시글 하나를 식별하는 URL 파라미터입니다.
postsRouter.get("/:id", getPost);

// validatePostInput을 통과한 요청만 마지막 라우트 처리 함수까지 도착합니다.
postsRouter.post("/", validatePostInput, createPost);

export default postsRouter;
