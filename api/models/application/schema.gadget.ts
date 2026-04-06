import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "application" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "w4MWm9Q2uEdl",
  fields: {
    channel: {
      type: "json",
      validations: { required: true },
      storageKey: "mZE9EMqBoOVm",
      filterIndex: false,
      searchIndex: false,
    },
    description: {
      type: "string",
      validations: { stringLength: { min: 0, max: 100 } },
      storageKey: "PAaA469vj-uW",
    },
    emoji: { type: "json", storageKey: "mDk_KDmcQZIu" },
    guild: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "guild" },
      storageKey: "_Liw2VQ5F9dZ",
    },
    handlerRole: {
      type: "json",
      validations: { required: true },
      storageKey: "Wwnwc6ddPQ09",
      filterIndex: false,
      searchIndex: false,
    },
    modal: { type: "json", storageKey: "dFk9HZdfObQK" },
    numQuestions: {
      type: "computed",
      sourceFile: "api/models/application/numQuestions.gelly",
      storageKey: "WDT-FJFyelMC",
    },
    questions: {
      type: "hasMany",
      children: { model: "question", belongsToField: "application" },
      storageKey: "CtbpzVE-O_Bq",
    },
    removeRoles: {
      type: "json",
      default: [],
      storageKey: "ARiQE1GM_i5t",
    },
    roles: { type: "json", storageKey: "7keXNa_-iojO" },
    submittedApplications: {
      type: "hasMany",
      children: {
        model: "submittedApplications",
        belongsToField: "application",
      },
      storageKey: "vORcQifiLvlU",
    },
    title: {
      type: "string",
      validations: {
        required: true,
        stringLength: { min: 1, max: 45 },
      },
      storageKey: "7Bx9UYELK3Hu",
    },
  },
};
