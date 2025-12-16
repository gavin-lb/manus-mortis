import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "bounty/posted" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "xPASEsdDbHnM",
  fields: {
    bounty_channel_id: { type: "string", storageKey: "by0WNEEWSZ11" },
    bounty_guild_id: { type: "string", storageKey: "XgfoKCmQVH1N" },
    bounty_message_id: { type: "string", storageKey: "45y40E0X6-fV" },
    channel_id: { type: "string", storageKey: "Ycz6c1Lz_0Ic" },
    claims: {
      type: "hasMany",
      children: { model: "bounty/claimed", belongsToField: "posted" },
      storageKey: "i9zmUTvkhFVI",
    },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "2E4GNMYzRySc",
    },
    guild_id: { type: "string", storageKey: "oGXWc-88giFE" },
    message_id: { type: "string", storageKey: "TJ5WUb87jDD8" },
    status: {
      type: "enum",
      default: "active",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "expired"],
      validations: { required: true },
      storageKey: "km8Bnp2jUuN1",
    },
  },
};
