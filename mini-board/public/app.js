const staticMessage = document.querySelector("#static-message");
const postForm = document.querySelector("#post-form");
const formMessage = document.querySelector("#form-message");
const postsStatus = document.querySelector("#posts-status");
const postsList = document.querySelector("#posts-list");
const POSTS_API_URL = "/api/posts";

if (staticMessage) {
  staticMessage.textContent = "CSS와 브라우저 JavaScript 파일이 정적 파일로 제공되었습니다.";
}

function renderPosts(posts) {
  postsList.innerHTML = "";

  for (const post of posts) {
    const postItem = document.createElement("li");
    const title = document.createElement("h3");
    const content = document.createElement("p");
    const author = document.createElement("small");

    postItem.className = "post-item";

    // API에서 받은 문자열은 textContent로 넣어 브라우저가 HTML로 해석하지 않게 합니다.
    title.textContent = post.title;
    content.textContent = post.content;
    author.textContent = `작성자: ${post.author}`;

    postItem.append(title, content, author);
    postsList.append(postItem);
  }
}

async function loadPosts() {
  try {
    // 브라우저에서 서버 API를 호출하고, 응답으로 받은 JSON을 화면 데이터로 사용합니다.
    const response = await fetch(POSTS_API_URL);

    if (!response.ok) {
      throw new Error("게시글 API 요청에 실패했습니다.");
    }

    const posts = await response.json();
    renderPosts(posts);
    postsStatus.textContent = `게시글 ${posts.length}개를 불러왔습니다.`;
  } catch (error) {
    console.error(error);
    postsStatus.textContent = "게시글을 불러오지 못했습니다.";
  }
}

if (postsStatus && postsList) {
  loadPosts();
}

async function createPost(formData) {
  const postData = {
    title: formData.get("title"),
    content: formData.get("content"),
    author: formData.get("author")
  };

  // 브라우저가 JSON 문자열을 서버로 보내면 express.json()이 req.body로 바꿔 줍니다.
  const response = await fetch(POSTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(postData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "게시글 저장에 실패했습니다.");
  }

  return result;
}

if (postForm && formMessage) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "게시글을 저장하는 중입니다.";

    try {
      await createPost(new FormData(postForm));
      postForm.reset();
      formMessage.textContent = "게시글을 저장했습니다.";
      await loadPosts();
    } catch (error) {
      console.error(error);
      formMessage.textContent = error.message;
    }
  });
}
