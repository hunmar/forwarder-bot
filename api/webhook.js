import { createBot } from "../src/createBot.js";
import { config } from "../src/config.js";
import { logger } from "../src/logger.js";

const bot = createBot();

// bot.init() calls Telegram's getMe to populate botInfo,
// which grammY requires before handleUpdate() can process updates.
let initPromise = null;

function ensureInitialized() {
  if (!initPromise) {
    logger.info("bot_init_started");
    initPromise = bot.init().then(() => {
      logger.info("bot_init_completed", {
        botId: bot.botInfo.id,
        botUsername: bot.botInfo.username
      });
    }).catch((error) => {
      logger.error("bot_init_failed", {
        message: error?.message,
        stack: error?.stack
      });
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

logger.info("webhook_handler_initialized", {
  hasSecretToken: Boolean(config.telegramSecretToken),
  webhookUrlConfigured: Boolean(config.webhookUrl)
});

export default async function handler(req, res) {
  const requestMeta = {
    method: req.method,
    path: req.url,
    hasBody: Boolean(req.body),
    userAgent: req.headers["user-agent"],
    vercelRequestId: req.headers["x-vercel-id"]
  };

  logger.info("webhook_request_received", requestMeta);

  if (req.method !== "POST") {
    logger.info("webhook_non_post", requestMeta);
    res.status(200).send("ok");
    return;
  }

  if (config.telegramSecretToken) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== config.telegramSecretToken) {
      logger.warn("webhook_unauthorized", {
        ...requestMeta,
        hasSecretHeader: Boolean(header)
      });
      res.status(401).send("unauthorized");
      return;
    }
  }

  const updateId = req.body?.update_id;

  try {
    await ensureInitialized();
    logger.info("webhook_update_received", { ...requestMeta, updateId });
    await bot.handleUpdate(req.body);
    logger.info("webhook_update_processed", { ...requestMeta, updateId, statusCode: 200 });
    res.status(200).send("ok");
  } catch (error) {
    logger.error("webhook_error", {
      ...requestMeta,
      updateId,
      message: error?.message,
      stack: error?.stack
    });
    res.status(500).send("error");
  }
}
