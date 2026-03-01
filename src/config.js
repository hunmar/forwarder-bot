import dotenv from "dotenv";

dotenv.config();

const required = ["BOT_TOKEN", "SOURCE_CHAT_ID", "TARGET_CHAT_ID", "FORWARD_HASHTAG"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const normalizeHashtag = (value) => {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`;
};

export const config = {
  botToken: process.env.BOT_TOKEN,
  sourceChatId: Number(process.env.SOURCE_CHAT_ID),
  targetChatId: Number(process.env.TARGET_CHAT_ID),
  forwardHashtag: normalizeHashtag(process.env.FORWARD_HASHTAG),
  telegramSecretToken: process.env.TELEGRAM_SECRET_TOKEN,
  webhookUrl: process.env.WEBHOOK_URL
};

if (Number.isNaN(config.sourceChatId) || Number.isNaN(config.targetChatId)) {
  throw new Error("SOURCE_CHAT_ID and TARGET_CHAT_ID must be valid numbers");
}
