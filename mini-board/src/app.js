import express from "express";
import { createPost, getPostById, readPosts } from "./data/postsFile.js";
import { indexFilePath, notFoundFilePath, publicDirectoryPath } from "./config/paths.js";

const app = express();

// JSON 요청 본문을 req.body 객체로 바꿔 POST 라우트에서 사용할 수 있게 합니다.
app.use(express.json());

// 정적 파일 제공은 앱 전체 설정에 가까워서 Express 앱을 조립하는 곳에 둡니다.
app.use("/static", express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  res.sendFile(indexFilePath);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    project: "mini-board",
    step: 8
  });
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await readPosts();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 파일을 읽을 수 없습니다." });
  }
});

app.get("/posts/:id", async (req, res) => {
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

app.post("/posts", async (req, res) => {
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

app.use((req, res) => {
  res.status(404).sendFile(notFoundFilePath);
});

export default app;
