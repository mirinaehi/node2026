import { Router } from "express";
import { createPost, getPostById, readPosts } from "../data/postsFile.js";

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

postsRouter.post("/", async (req, res) => {
  // ?.는 값이 없을 때 에러를 내지 않고 undefined를 돌려주는 optional chaining입니다.
  // req.body.title ? req.body.title.trim() : undefined;
  const title = req.body.title?.trim();
  const content = req.body.content?.trim();
  const author = req.body.author?.trim();

  if (!title || !content) {
    res.status(400).json({ message: "제목과 내용을 입력해 주세요." });
    return;
  }

  try {
    const post = await createPost({ title, content, author });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글을 저장할 수 없습니다." });
  }
});

export default postsRouter;
