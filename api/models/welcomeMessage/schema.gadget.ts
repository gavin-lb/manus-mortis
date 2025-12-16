import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "welcomeMessage" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "4zPdKdLXYDmV",
  fields: {
    channel: {
      type: "json",
      validations: { required: true },
      storageKey: "CAnpoT1zllhg",
      filterIndex: false,
      searchIndex: false,
    },
    image: {
      type: "file",
      allowPublicAccess: false,
      validations: { imagesOnly: { allowAnimatedImages: true } },
      storageKey: "-d1A2uPr2Mbm",
    },
    message: {
      type: "string",
      validations: { required: true },
      storageKey: "WILEDlI637Zm",
      filterIndex: false,
      searchIndex: false,
    },
    role: {
      type: "json",
      validations: { required: true },
      storageKey: "RquOCX31nFR7",
      searchIndex: false,
    },
    sentWelcomeMessages: {
      type: "hasMany",
      children: {
        model: "sentWelcomeMessage",
        belongsToField: "welcomeMessage",
      },
      storageKey: "wYJW9vSCfmPq",
    },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "hK0I27aYqPUR",
      filterIndex: false,
      searchIndex: false,
    },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["role", "member"],
      validations: { required: true },
      storageKey: "0D6c62aX6aoE",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
