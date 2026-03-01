import { config } from "../src/config.js";

if (!config.webhookUrl) {
  throw new Error("WEBHOOK_URL is required to configure webhook");
}

const endpoint = `https://api.telegram.org/bot${config.botToken}/setWebhook`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: config.webhookUrl,
    secret_token: config.telegramSecretToken
  })
});

const payload = await response.json();
console.log(payload);

if (!payload.ok) {
  throw new Error(`setWebhook failed: ${JSON.stringify(payload)}`);
}
