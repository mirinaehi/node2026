import express from "express";
import { getPostById, readPosts } from "./data/postsFile.js";
import { indexFilePath, notFoundFilePath, publicDirectoryPath } from "./config/paths.js";

const app = express();

// 정적 파일 제공은 앱 전체 설정에 가까워서 Express 앱을 조립하는 곳에 둡니다.
app.use("/static", express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  res.sendFile(indexFilePath);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    project: "mini-board",
    step: 7
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

app.use((req, res) => {
  res.status(404).sendFile(notFoundFilePath);
});

export default app;
