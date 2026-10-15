export default function validatePostInput(req, res, next) {
  // 각 ?.는 왼쪽 값이 없을 때 에러 대신 undefined를 돌려주는 optional chaining입니다.
  const title = req.body?.title?.trim();
  const content = req.body?.content?.trim();
  const author = req.body?.author?.trim();

  if (!title || !content) {
    // 응답을 보내고 next()를 호출하지 않으면 요청 처리가 여기서 끝납니다.
    res.status(400).json({ message: "제목과 내용을 입력해 주세요." });
    return;
  }

  req.postInput = { title, content, author };
  next();
}
