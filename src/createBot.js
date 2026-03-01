import { Bot } from "grammy";
import { config } from "./config.js";
import { messageHasConfiguredHashtag } from "./forwardLogic.js";

export const createBot = () => {
  const bot = new Bot(config.botToken);

  bot.on("message", async (ctx) => {
    if (ctx.chat.id !== config.sourceChatId) {
      return;
    }

    if (!messageHasConfiguredHashtag(ctx.msg)) {
      return;
    }

    await ctx.api.copyMessage(config.targetChatId, ctx.chat.id, ctx.msg.message_id);
  });

  bot.catch((error) => {
    console.error("Bot error:", error.error);
  });

  return bot;
};
