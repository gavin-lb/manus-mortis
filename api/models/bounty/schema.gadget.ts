import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "bounty" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DYBSc-ghfjhl",
  fields: {
    author: {
      type: "string",
      validations: { required: true },
      storageKey: "W8JY1uUAQ9mP",
    },
    avatar: {
      type: "string",
      validations: { required: true },
      storageKey: "YjiEgQMoh6pd",
    },
    bountyChannelId: { type: "string", storageKey: "aiqC28c6lMnZ" },
    bountyMessageId: { type: "string", storageKey: "SOZJKAYBWL80" },
    channelId: { type: "string", storageKey: "YVHeL7meOHPv" },
    claimedBounties: {
      type: "hasMany",
      children: { model: "claimedBounty", belongsToField: "bounty" },
      storageKey: "RvAiBsb_pqdS",
    },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "-2aZkQrHT_C3",
    },
    formattedMessage: { type: "string", storageKey: "72GSwEQifnyE" },
    guildId: { type: "string", storageKey: "Oi61yZiVLPjI" },
    messageId: { type: "string", storageKey: "GE9B6jxlwQIA" },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "expired"],
      storageKey: "GkHu0q3zY4ru",
    },
  },
};
