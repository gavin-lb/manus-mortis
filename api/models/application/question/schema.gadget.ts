import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "application/question" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "5oWj77fdr8SN",
  fields: {
    answers: {
      type: "hasMany",
      children: {
        model: "application/answer",
        belongsToField: "question",
      },
      storageKey: "2yrXJo_yAA60",
    },
    body: {
      type: "string",
      validations: { required: true },
      storageKey: "a0yLoL7vq-If",
    },
    components: {
      type: "json",
      validations: { required: true },
      storageKey: "EszmeTziUSKo",
    },
    conditional: { type: "json", storageKey: "7WnC5glOyM8d" },
    form: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "application/form" },
      storageKey: "pGlFqtDjjPiy",
    },
    is_final: {
      type: "boolean",
      default: false,
      validations: { required: true },
      storageKey: "3MRsCMi__5UB",
    },
    modal: { type: "json", storageKey: "NCS3yhPzMSle" },
    number: {
      type: "number",
      decimals: 0,
      validations: {
        required: true,
        numberRange: { min: 1, max: null },
      },
      storageKey: "qJ721sky-tkD",
    },
    responses: { type: "json", storageKey: "R1RdYtVIysl5" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "ONpRmfdA3tgF",
    },
  },
};
