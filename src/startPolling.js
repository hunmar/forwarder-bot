import { createBot } from "./createBot.js";
import { config } from "./config.js";

const bot = createBot();

console.log(`Starting polling mode. Forwarding ${config.forwardHashtag} from ${config.sourceChatId} to ${config.targetChatId}`);

await bot.start();
