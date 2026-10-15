import { Router } from "express";
import { createPost, getPostById, readPosts } from "../data/postsFile.js";
import validatePostInput from "../middleware/validatePostInput.js";

const postsRouter = Router();

// 상위 라우터가 /api/posts를 담당하므로 여기서는 그 뒤의 경로만 작성합니다.
postsRouter.get("/", async (req, res) => {
  try {
    const posts = await readPosts();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 파일을 읽을 수 없습니다." });
  }
});

// :id는 게시글 하나를 식별하는 URL 파라미터입니다.
postsRouter.get("/:id", async (req, res) => {
  try {
    const post = await getPostById(req.params.id);

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 파일을 읽을 수 없습니다." });
  }
});

// validatePostInput을 통과한 요청만 마지막 라우트 처리 함수까지 도착합니다.
postsRouter.post("/", validatePostInput, async (req, res) => {
  try {
    const post = await createPost(req.postInput);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글을 저장할 수 없습니다." });
  }
});

export default postsRouter;
