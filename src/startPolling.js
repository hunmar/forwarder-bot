import { createBot } from "./createBot.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const bot = createBot();

logger.info("starting_polling_mode", {
  sourceChatId: config.sourceChatId,
  targetChatId: config.targetChatId,
  forwardHashtag: config.forwardHashtag
});

await bot.start();
