import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "submittedApplications" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "ColVNubc6pHu",
  fields: {
    application: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "application" },
      storageKey: "ColVNubc6pHu-BelongsTo-User",
    },
    channelId: {
      type: "string",
      validations: { required: true },
      storageKey: "pmbUzEQfKEOy",
    },
    data: {
      type: "json",
      validations: { required: true },
      storageKey: "QI_nn9FOxwcf",
    },
    ownerId: {
      type: "string",
      validations: { required: true },
      storageKey: "e_3Pvq57HulO",
    },
    ownerName: {
      type: "string",
      validations: { required: true },
      storageKey: "CTVWmHBPxDQy",
    },
    roles: { type: "json", storageKey: "wryN1lXYjTyt" },
    status: {
      type: "enum",
      default: "open",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "accepted", "denied", "withdrawn"],
      validations: { required: true },
      storageKey: "WBmTwSnNR2IO",
    },
    threadId: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "channelId" },
      },
      storageKey: "Uudm4hC5sVod",
    },
  },
};
