import {
  createPost as savePost,
  getPostById,
  readPosts
} from "../data/postsFile.js";

// 저장 함수와 컨트롤러 함수의 이름이 겹치지 않도록 createPost를 savePost라는 이름으로 가져옵니다.
// 컨트롤러는 req에서 요청값을 꺼내고 res로 HTTP 응답을 보내는 역할을 맡습니다.
export async function getPosts(req, res) {
  try {
    const posts = await readPosts();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 파일을 읽을 수 없습니다." });
  }
}

export async function getPost(req, res) {
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
}

export async function createPost(req, res) {
  try {
    // 입력 검사 미들웨어가 정리한 값을 컨트롤러가 받아 저장 함수에 전달합니다.
    const post = await savePost(req.postInput);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글을 저장할 수 없습니다." });
  }
}
