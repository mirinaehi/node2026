import { useEffect, useState } from "react";

const POSTS_API_URL = "http://localhost:3000/api/posts";
const EMPTY_FORM = {
  title: "",
  content: "",
  author: ""
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [listMessage, setListMessage] = useState("게시글을 불러오는 중입니다.");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPosts() {
    try {
      // React(5173)에서 다른 출처인 Express(3000)로 요청하므로 서버의 CORS 허용이 필요합니다.
      const response = await fetch(POSTS_API_URL);

      if (!response.ok) {
        throw new Error("게시글 API 요청에 실패했습니다.");
      }

      const data = await response.json();
      setPosts(data);
      setListMessage(`게시글 ${data.length}개를 불러왔습니다.`);
    } catch (error) {
      console.error(error);
      setListMessage("게시글을 불러오지 못했습니다.");
    }
  }

  // 빈 배열을 전달하면 컴포넌트가 처음 화면에 나타날 때 한 번 API를 호출합니다.
  useEffect(() => {
    loadPosts();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    // 입력값을 React state에 저장해 폼 요소와 화면 상태를 일치시킵니다.
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage("게시글을 저장하는 중입니다.");

    try {
      const response = await fetch(POSTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "게시글 저장에 실패했습니다.");
      }

      setPosts((currentPosts) => [...currentPosts, result]);
      setForm(EMPTY_FORM);
      setFormMessage("게시글을 저장했습니다.");
      setListMessage(`게시글 ${posts.length + 1}개를 불러왔습니다.`);
    } catch (error) {
      console.error(error);
      setFormMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">NODE + EXPRESS + REACT</p>
          <h1>Mini Board</h1>
        </div>
        <a href="http://localhost:3000/api/health">API 상태</a>
      </header>

      <section className="write-section" aria-labelledby="write-heading">
        <h2 id="write-heading">게시글 작성</h2>
        <form className="post-form" onSubmit={handleSubmit}>
          <label>
            제목
            <input
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            내용
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </label>

          <label>
            작성자
            <input
              name="author"
              value={form.author}
              onChange={handleInputChange}
              placeholder="익명"
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "게시글 저장"}
          </button>
        </form>
        <p className="status-message" aria-live="polite">{formMessage}</p>
      </section>

      <section className="posts-section" aria-labelledby="posts-heading">
        <div className="section-heading">
          <h2 id="posts-heading">게시글 목록</h2>
          <button className="secondary-button" type="button" onClick={loadPosts}>
            새로고침
          </button>
        </div>
        <p className="list-message" aria-live="polite">{listMessage}</p>

        <ul className="posts-list">
          {posts.map((post) => (
            <li className="post-item" key={post.id}>
              <div className="post-meta">
                <span>#{post.id}</span>
                <span>{post.author}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
