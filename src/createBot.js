import { Bot } from "grammy";
import { config } from "./config.js";
import { messageHasConfiguredHashtag } from "./forwardLogic.js";
import { logger } from "./logger.js";

export const createBot = () => {
  const bot = new Bot(config.botToken);

  const maybeForwardMessage = async (message, chat) => {
    if (chat.id !== config.sourceChatId) {
      logger.debug("message_skipped_wrong_chat", {
        chatId: chat.id,
        sourceChatId: config.sourceChatId,
        messageId: message.message_id
      });
      return;
    }

    if (!messageHasConfiguredHashtag(message)) {
      logger.debug("message_skipped_missing_hashtag", {
        chatId: chat.id,
        messageId: message.message_id,
        expectedHashtag: config.forwardHashtag
      });
      return;
    }

    await bot.api.copyMessage(config.targetChatId, chat.id, message.message_id);

    logger.info("message_forwarded", {
      fromChatId: chat.id,
      toChatId: config.targetChatId,
      messageId: message.message_id,
      hashtag: config.forwardHashtag
    });
  };

  const replyWithChatId = async (ctx) => {
    const chatType = ctx.chat?.type;

    logger.info("id_command_called", {
      chatId: ctx.chat?.id,
      chatType,
      userId: ctx.from?.id,
      text: ctx.msg?.text
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
      userId: ctx.from?.id,
      text: ctx.msg?.text
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
    await maybeForwardMessage(ctx.msg, ctx.chat);
  });

  bot.on("channel_post", async (ctx) => {
    await maybeForwardMessage(ctx.channelPost, ctx.chat);
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
