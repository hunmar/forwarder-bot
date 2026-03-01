import { createBot } from "../src/createBot.js";
import { config } from "../src/config.js";
import { logger } from "../src/logger.js";

const bot = createBot();

logger.info("webhook_handler_initialized", {
  hasSecretToken: Boolean(config.telegramSecretToken),
  webhookUrlConfigured: Boolean(config.webhookUrl)
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    logger.debug("webhook_non_post", { method: req.method });
    res.status(200).send("ok");
    return;
  }

  if (config.telegramSecretToken) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== config.telegramSecretToken) {
      logger.warn("webhook_unauthorized", {
        method: req.method,
        hasSecretHeader: Boolean(header)
      });
      res.status(401).send("unauthorized");
      return;
    }
  }

  const updateId = req.body?.update_id;

  try {
    logger.info("webhook_update_received", { updateId });
    await bot.handleUpdate(req.body);
    res.status(200).send("ok");
  } catch (error) {
    logger.error("webhook_error", {
      updateId,
      message: error?.message,
      stack: error?.stack
    });
    res.status(500).send("error");
  }
}
