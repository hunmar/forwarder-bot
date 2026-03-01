import { config } from "../src/config.js";
import { logger } from "../src/logger.js";

if (!config.webhookUrl) {
  throw new Error("WEBHOOK_URL is required to configure webhook");
}

const baseEndpoint = `https://api.telegram.org/bot${config.botToken}`;
const setWebhookEndpoint = `${baseEndpoint}/setWebhook`;
const getWebhookInfoEndpoint = `${baseEndpoint}/getWebhookInfo`;

logger.info("set_webhook_started", {
  webhookUrl: config.webhookUrl,
  hasSecretToken: Boolean(config.telegramSecretToken)
});

const response = await fetch(setWebhookEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: config.webhookUrl,
    secret_token: config.telegramSecretToken,
    allowed_updates: ["message", "channel_post"],
    drop_pending_updates: true
  })
});

const payload = await response.json();
logger.info("set_webhook_response", {
  ok: payload.ok,
  description: payload.description
});

if (!payload.ok) {
  throw new Error(`setWebhook failed: ${JSON.stringify(payload)}`);
}

const infoResponse = await fetch(getWebhookInfoEndpoint);
const infoPayload = await infoResponse.json();

logger.info("webhook_info", {
  ok: infoPayload.ok,
  url: infoPayload.result?.url,
  hasCustomCertificate: infoPayload.result?.has_custom_certificate,
  pendingUpdateCount: infoPayload.result?.pending_update_count,
  lastErrorDate: infoPayload.result?.last_error_date,
  lastErrorMessage: infoPayload.result?.last_error_message,
  maxConnections: infoPayload.result?.max_connections,
  ipAddress: infoPayload.result?.ip_address
});

if (!infoPayload.ok) {
  throw new Error(`getWebhookInfo failed: ${JSON.stringify(infoPayload)}`);
}

logger.info("set_webhook_finished", {
  webhookUrl: infoPayload.result?.url,
  pendingUpdateCount: infoPayload.result?.pending_update_count
});
