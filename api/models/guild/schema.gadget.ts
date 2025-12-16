import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "guild" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eYJCD1p3wt2x",
  fields: {
    afk_voice_channels: { type: "json", storageKey: "WYHSMwT6usJf" },
    bounty_channel: { type: "string", storageKey: "-zJBH3yywG5l" },
    guild_id: { type: "string", storageKey: "HiEnQuE5tPZc" },
    jobs_channel: { type: "string", storageKey: "1EB_aQ4gw6Vo" },
    owner_id: { type: "string", storageKey: "Bj2sd_yArvYb" },
    role_ids: { type: "json", storageKey: "EBwCijHZzFTc" },
    threads: {
      type: "hasMany",
      children: {
        model: "application/thread",
        belongsToField: "guild",
      },
      storageKey: "Ko3dbT1vPhB_",
    },
    ticket_channel: { type: "string", storageKey: "JIzk5KGFkwNG" },
    tickets: {
      type: "hasMany",
      children: { model: "ticket", belongsToField: "guild" },
      storageKey: "YnTwtqy9bl6g",
    },
  },
};
