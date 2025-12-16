import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "bounty/claimed" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ilouGw3BAtM1",
  fields: {
    posted: {
      type: "belongsTo",
      parent: { model: "bounty/posted" },
      storageKey: "WXr7iog9jkKg",
    },
    user_id: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "posted" },
      },
      storageKey: "w1tZrRLulYMc",
    },
  },
};
