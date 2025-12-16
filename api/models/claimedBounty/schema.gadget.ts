import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "claimedBounty" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "fE64kTbyy0e_",
  fields: {
    bounty: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "bounty" },
      storageKey: "uax3AWJiA_2x",
    },
    userId: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "bounty" },
      },
      storageKey: "V254Qa6bcy42",
    },
  },
};
