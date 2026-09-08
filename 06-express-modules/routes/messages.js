import { Router } from "express";
import { findMessageById, getMessages } from "../services/messageService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const messages = await getMessages();

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const messageId = Number(req.params.id);
    const message = await findMessageById(messageId);

    if (!message) {
      res.status(404).json({
        message: `${messageId}번 메시지를 찾을 수 없습니다.`,
      });
      return;
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

export default router;

