import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "create_poll" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "PHr5Zh5EPjwe",
  fields: {
    message_id: { type: "string", storageKey: "rGaJObzd5i9c" },
    options: {
      type: "json",
      default: ["Agree", "Disagree"],
      storageKey: "0h9Bzp3YtTj4",
    },
    title: { type: "string", storageKey: "0NBhOjsK-vUu" },
    tokens: { type: "json", storageKey: "GpAap4AuVBO2" },
  },
};
