import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootPath = path.join(__dirname, "..", "..");

// 여러 파일에서 쓰는 경로를 한 곳에서 export하면 경로 변경에 강해집니다.
export const postsFilePath = path.join(projectRootPath, "data", "posts.json");
export const publicDirectoryPath = path.join(projectRootPath, "public");
export const indexFilePath = path.join(publicDirectoryPath, "index.html");
export const notFoundFilePath = path.join(publicDirectoryPath, "404.html");
