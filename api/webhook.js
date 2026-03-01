import { createBot } from "../src/createBot.js";
import { config } from "../src/config.js";

const bot = createBot();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(200).send("ok");
    return;
  }

  if (config.telegramSecretToken) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== config.telegramSecretToken) {
      res.status(401).send("unauthorized");
      return;
    }
  }

  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("ok");
  } catch (error) {
    console.error("Webhook error", error);
    res.status(500).send("error");
  }
}
