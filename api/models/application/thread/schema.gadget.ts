import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "application/thread" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "tkN2919l7XI2",
  fields: {
    allegiance: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["ally", "enemy", "remnant", "ancient", "pagan"],
      storageKey: "yAoMqXyL8TbE",
    },
    answers: {
      type: "hasMany",
      children: {
        model: "application/answer",
        belongsToField: "thread",
      },
      storageKey: "is_9FrR6Xz6C",
    },
    channel_id: { type: "string", storageKey: "GYhIdixqQvQj" },
    comments: { type: "string", storageKey: "lr1-lBzxt0eu" },
    form: {
      type: "belongsTo",
      parent: { model: "application/form" },
      storageKey: "h1WMiQ9B1V7z",
    },
    guild: {
      type: "belongsTo",
      parent: { model: "guild" },
      storageKey: "LNK7qvZiEpHc",
    },
    handled_by: { type: "string", storageKey: "tC0rIq5NiQYa" },
    number_answered: {
      type: "number",
      default: 1,
      storageKey: "nINv-ghuVfSn",
    },
    owner: { type: "json", storageKey: "ZtSK1If69Mye" },
    status: {
      type: "enum",
      default: "open",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "accepted", "denied", "withdrawn", "pending"],
      storageKey: "Ca2bQxTPlHa4",
    },
    thread_id: { type: "string", storageKey: "Mee1tF5YNI3N" },
  },
};
