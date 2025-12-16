import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "question" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "u0WjIQ_s7aow",
  fields: {
    application: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "application" },
      storageKey: "s6onxdtB0J3D",
      searchIndex: false,
    },
    description: {
      type: "string",
      validations: { stringLength: { min: 1, max: 100 } },
      storageKey: "-MsZR-OkwV6N",
    },
    index: {
      type: "number",
      default: 0,
      decimals: 0,
      validations: {
        required: true,
        numberRange: { min: 0, max: null },
      },
      storageKey: "bdGlCMy7jt_e",
    },
    isCharLimited: {
      type: "boolean",
      default: false,
      storageKey: "7xXu7l0WYd7m",
    },
    isMultiSelect: {
      type: "boolean",
      default: false,
      storageKey: "NzPKupzRTokp",
    },
    isMultiUpload: {
      type: "boolean",
      default: false,
      storageKey: "0ZKYIT2PSJmY",
    },
    isRequired: {
      type: "boolean",
      default: true,
      validations: { required: true },
      storageKey: "_9FqX5sXveJ2",
    },
    max: {
      type: "number",
      default: 2,
      decimals: 0,
      storageKey: "ksbKvv0TlFre",
    },
    min: {
      type: "number",
      default: 1,
      decimals: 0,
      storageKey: "wzZCKj5erOH2",
    },
    placeholder: {
      type: "string",
      validations: { stringLength: { min: 1, max: 100 } },
      storageKey: "pSe6GG_6ur7_",
    },
    stringSelectOptions: { type: "json", storageKey: "Tw_tURFyxXGW" },
    textInputStyle: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["1", "2"],
      storageKey: "Kis-VF3i5WVp",
    },
    title: {
      type: "string",
      validations: {
        required: true,
        stringLength: { min: 1, max: 45 },
      },
      storageKey: "6LmXXkacV-Kv",
    },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["3", "4", "19", "5"],
      validations: { required: true },
      storageKey: "5OMgSB9zy0sL",
    },
  },
};
