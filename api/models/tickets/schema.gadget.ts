import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "tickets" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "HlUQs517gLRb",
  fields: {
    body: {
      type: "string",
      validations: { required: true },
      storageKey: "yVBCwursuIJe",
    },
    channelId: {
      type: "string",
      validations: { required: true },
      storageKey: "EtFJsUYNMWnB",
    },
    messageId: {
      type: "string",
      validations: { required: true },
      storageKey: "YiFGA1EHZrEt",
    },
    ownerAvatar: {
      type: "string",
      validations: { required: true },
      storageKey: "ggMnLnyjugY_",
    },
    ownerId: {
      type: "string",
      validations: { required: true },
      storageKey: "u36FuEM0350p",
    },
    ownerName: {
      type: "string",
      validations: { required: true },
      storageKey: "NjWi2Wf6l1hj",
    },
    status: {
      type: "enum",
      default: "open",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "closed"],
      storageKey: "smVWEigkr1Dd",
    },
    threadId: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "channelId" },
      },
      storageKey: "gK9Hpyqo8a9w",
    },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "ZuL4YbbkS4a1",
    },
  },
};
