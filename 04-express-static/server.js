const express = require("express");
const path = require("path");

const app = express();
const PORT = 4300;
const PUBLIC_DIR = path.join(__dirname, "public");
const NOT_FOUND_FILE = path.join(PUBLIC_DIR, "404.html");

app.use(express.static(PUBLIC_DIR));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-static",
  });
});

app.use((req, res) => {
  res.status(404).sendFile(NOT_FOUND_FILE);
});

app.listen(PORT, () => {
  console.log(`Express static server: http://localhost:${PORT}`);
});

