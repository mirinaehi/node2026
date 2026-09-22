import http from "node:http";

const PORT = 3000;

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  console.log(`${req.method} ${requestUrl.pathname}`);

  if (requestUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Mini Board 서버가 요청을 받고 응답했습니다.");
    return;
  }

  if (requestUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        status: "ok",
        project: "mini-board",
        step: 1
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("요청한 주소를 찾을 수 없습니다.");
});

server.listen(PORT, () => {
  console.log(`Mini Board server is running at http://localhost:${PORT}`);
});
