import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "ticket" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "7fFtU5UjU564",
  fields: {
    body: { type: "string", storageKey: "Csy27I6YKky7" },
    guild: {
      type: "belongsTo",
      parent: { model: "guild" },
      storageKey: "7vEcf4MRCOtl",
    },
    message_id: { type: "string", storageKey: "YBNXevs-YzMB" },
    owner_id: { type: "string", storageKey: "1pbPJd2bAh8H" },
    owner_name: { type: "string", storageKey: "ECfJ1veMr05u" },
    status: {
      type: "enum",
      default: "open",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "closed"],
      storageKey: "f6qcErtcSQsX",
    },
    thread_id: { type: "string", storageKey: "uxR0bdLwEHDC" },
    thread_title: { type: "string", storageKey: "x0g4JkB3xcR1" },
    title: { type: "string", storageKey: "dMjFA5fUAl89" },
  },
};
