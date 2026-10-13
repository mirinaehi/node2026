import app from "./src/app.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Mini Board server is running at http://localhost:${PORT}`);
});
