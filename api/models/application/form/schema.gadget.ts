import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "application/form" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Zr-QX4G0REnw",
  fields: {
    name: { type: "string", storageKey: "qrDrhFiuYd8s" },
    questions: {
      type: "hasMany",
      children: {
        model: "application/question",
        belongsToField: "form",
      },
      storageKey: "LL40SSMcd-Yv",
    },
    threads: {
      type: "hasMany",
      children: {
        model: "application/thread",
        belongsToField: "form",
      },
      storageKey: "TdN7a1LI2-F6",
    },
    title: { type: "string", storageKey: "C_oKRg-BM5by" },
  },
};
