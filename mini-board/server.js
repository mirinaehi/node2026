import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const postsFilePath = path.join(__dirname, "data", "posts.json");
const publicDirectoryPath = path.join(__dirname, "public");
const indexFilePath = path.join(publicDirectoryPath, "index.html");
const notFoundFilePath = path.join(publicDirectoryPath, "404.html");

async function readPosts() {
  const fileContents = await readFile(postsFilePath, "utf-8");
  return JSON.parse(fileContents);
}

// express.static이 public 폴더의 CSS, JS 같은 정적 파일 응답을 대신 처리합니다.
app.use("/static", express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  res.sendFile(indexFilePath);
});

app.get("/health", (req, res) => {
  // res.json은 객체를 JSON 문자열로 바꾸고 Content-Type도 자동으로 설정합니다.
  res.json({
    status: "ok",
    project: "mini-board",
    step: 5
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
    const posts = await readPosts();
    const postId = Number(req.params.id);
    const post = posts.find((item) => item.id === postId);

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

// 위 라우트 중 어디에도 걸리지 않은 요청은 마지막 404 처리로 내려옵니다.
app.use((req, res) => {
  res.status(404).sendFile(notFoundFilePath);
});

app.listen(PORT, () => {
  console.log(`Mini Board server is running at http://localhost:${PORT}`);
});
