import { readFile, writeFile } from "node:fs/promises";
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

export async function createPost({ title, content, author }) {
  const posts = await readPosts();

  // at(-1)은 배열의 마지막 요소를 가져옵니다. 게시글이 없으면 undefined가 됩니다.
  const lastPost = posts.at(-1);
  const nextId = lastPost ? lastPost.id + 1 : 1;
  const newPost = {
    id: nextId,
    title,
    content,
    author: author || "익명"
  };

  // 파일 저장은 기존 배열에 새 게시글을 더한 뒤 JSON 문자열로 다시 쓰는 흐름입니다.
  // JSON.stringify의 null(replacer 함수 사용x), 2는 값을 바꾸지 않고 사람이 읽기 좋게 2칸 들여쓰기만 적용합니다.
  await writeFile(postsFilePath, JSON.stringify([...posts, newPost], null, 2), "utf-8");
  return newPost;
}
