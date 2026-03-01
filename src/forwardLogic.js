import { config } from "./config.js";

const getEntities = (message) => [
  ...(message.entities ?? []),
  ...(message.caption_entities ?? [])
];

export const messageHasConfiguredHashtag = (message) => {
  const text = message.text ?? message.caption;
  if (!text) {
    return false;
  }

  return getEntities(message)
    .filter((entity) => entity.type === "hashtag")
    .some((entity) => {
      const hashtag = text.substring(entity.offset, entity.offset + entity.length);
      return hashtag.toLowerCase() === config.forwardHashtag;
    });
};
