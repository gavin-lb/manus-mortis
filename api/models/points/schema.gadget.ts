import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "points" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "LtgImavPEsXr",
  fields: {
    guild_id: { type: "string", storageKey: "b6Kf4aEVpz67" },
    joined_voice_time: {
      type: "dateTime",
      includeTime: true,
      storageKey: "KPxMz2rf30xC",
    },
    message_count: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "FdxRjYdp1pF4",
    },
    other: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "UgaOhIwvr_0B",
    },
    react_count: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "MZhkp7SgSXo2",
    },
    referral_count: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "JhZorfFgj-I7",
    },
    seconds_in_voice: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "JtoF7Hd7G5_p",
    },
    training_count: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "QHrKjaEDVcok",
    },
    user_id: {
      type: "string",
      validations: {
        required: true,
        unique: { scopeByField: "guild_id" },
      },
      storageKey: "iv8B0p5UoPw0",
    },
    value: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "J-U_2RcAPukh",
    },
  },
};
