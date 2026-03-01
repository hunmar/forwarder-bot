import { Bot } from "grammy";
import { config } from "./config.js";
import { messageHasConfiguredHashtag } from "./forwardLogic.js";
import { logger } from "./logger.js";

export const createBot = () => {
  const bot = new Bot(config.botToken);

  const replyWithChatId = async (ctx) => {
    const chatType = ctx.chat?.type;

    logger.info("id_command_called", {
      chatId: ctx.chat?.id,
      chatType,
      userId: ctx.from?.id
    });

    await ctx.reply(`Chat ID: ${ctx.chat.id}`);
  };

  logger.info("bot_initialized", {
    sourceChatId: config.sourceChatId,
    targetChatId: config.targetChatId,
    forwardHashtag: config.forwardHashtag
  });

  bot.command("start", async (ctx) => {
    logger.info("start_command_called", {
      chatId: ctx.chat?.id,
      chatType: ctx.chat?.type,
      userId: ctx.from?.id
    });

    await ctx.reply(
      [
        "Привет! Я пересылаю сообщения с нужным хэштегом.",
        "",
        "Команды:",
        "/id — показать ID текущего чата",
        "/start — показать эту подсказку"
      ].join("\n")
    );
  });

  bot.command("id", replyWithChatId);

  bot.hears(/^\/id(?:@\w+)?(?:\s|$)/i, async (ctx) => {
    await replyWithChatId(ctx);
  });

  bot.on("message", async (ctx) => {
    if (ctx.chat.id !== config.sourceChatId) {
      logger.debug("message_skipped_wrong_chat", {
        chatId: ctx.chat.id,
        sourceChatId: config.sourceChatId,
        messageId: ctx.msg.message_id
      });
      return;
    }

    if (!messageHasConfiguredHashtag(ctx.msg)) {
      logger.debug("message_skipped_missing_hashtag", {
        chatId: ctx.chat.id,
        messageId: ctx.msg.message_id,
        expectedHashtag: config.forwardHashtag
      });
      return;
    }

    await ctx.api.copyMessage(config.targetChatId, ctx.chat.id, ctx.msg.message_id);

    logger.info("message_forwarded", {
      fromChatId: ctx.chat.id,
      toChatId: config.targetChatId,
      messageId: ctx.msg.message_id,
      hashtag: config.forwardHashtag
    });
  });

  bot.catch((error) => {
    logger.error("bot_error", {
      message: error.error?.message,
      stack: error.error?.stack,
      updateId: error.ctx?.update?.update_id
    });
  });

  return bot;
};
