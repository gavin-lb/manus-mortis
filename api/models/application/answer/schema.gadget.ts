import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "application/answer" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "H0iLEF1GGJdC",
  fields: {
    channel_id: { type: "string", storageKey: "tI3U6zEwyEJU" },
    question: {
      type: "belongsTo",
      parent: { model: "application/question" },
      storageKey: "M9csi1EtIGIt",
    },
    respondent_id: { type: "string", storageKey: "nxzJOvo0lx2i" },
    thread: {
      type: "belongsTo",
      parent: { model: "application/thread" },
      storageKey: "N7UEzeuEv0Z_",
    },
    title: { type: "string", storageKey: "RZp1QX4x-HS_" },
    value: { type: "string", storageKey: "o0GZgMYJ7FSX" },
  },
};
