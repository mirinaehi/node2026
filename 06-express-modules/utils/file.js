import { readFile } from "fs/promises";

export async function readJsonFile(filePath) {
  const text = await readFile(filePath, "utf-8");

  return JSON.parse(text);
}

