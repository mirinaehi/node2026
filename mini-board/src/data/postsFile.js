import { readFile } from "node:fs/promises";
import { postsFilePath } from "../config/paths.js";

export async function readPosts() {
  const fileContents = await readFile(postsFilePath, "utf-8");
  return JSON.parse(fileContents);
}

export async function getPostById(id) {
  const posts = await readPosts();
  const postId = Number(id);

  // 라우트는 req/res 처리만 하고, 게시글을 찾는 세부 코드는 별도 함수가 맡습니다.
  return posts.find((post) => post.id === postId);
}
