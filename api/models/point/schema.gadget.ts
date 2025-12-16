import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "point" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "eU7U7q02Yo5o",
  fields: {
    joinedVoice: {
      type: "dateTime",
      includeTime: true,
      storageKey: "pVLVi6jH64L0",
    },
    messageCount: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "fwdiJQCCiXON",
    },
    points: {
      type: "number",
      default: 0,
      decimals: 0,
      validations: { required: true },
      storageKey: "vXHwKUz9AEQ6",
    },
    reactCount: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "7olh3UpBkxel",
    },
    referralCount: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "3EPSEY66dHUb",
    },
    secondsInVoice: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "LkbCNf9Gt2UC",
    },
    userId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "YgLFBDiJZdI9",
    },
  },
};
