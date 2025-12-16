import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "sentWelcomeMessage" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "pTBz_WfNXLev",
  fields: {
    discordId: {
      type: "string",
      storageKey: "lfb5lpjxTKoN",
      filterIndex: false,
      searchIndex: false,
    },
    welcomeMessage: {
      type: "belongsTo",
      parent: { model: "welcomeMessage" },
      storageKey: "dZ1ZV2ZttRtt",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
