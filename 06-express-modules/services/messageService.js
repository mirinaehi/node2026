import path from "path";
import { fileURLToPath } from "url";
import { readJsonFile } from "../utils/file.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_FILE = path.join(__dirname, "..", "data", "messages.json");

export async function getMessages() {
  return readJsonFile(MESSAGES_FILE);
}

export async function findMessageById(messageId) {
  const messages = await getMessages();

  return messages.find((message) => message.id === messageId);
}

