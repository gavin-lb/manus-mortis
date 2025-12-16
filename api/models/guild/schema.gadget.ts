import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "guild" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DTtcTkOJd0-K",
  fields: {
    applications: {
      type: "hasMany",
      children: { model: "application", belongsToField: "guild" },
      storageKey: "Vin8mBY9nSC4",
    },
    bountyChannel: { type: "json", storageKey: "q7taKIWUU37a" },
    bountyHours: {
      type: "number",
      default: 24,
      decimals: 0,
      storageKey: "lT2OjXiPEj-U",
    },
    bountyHunter: { type: "json", storageKey: "CZ460jb-B8ku" },
    bountyMessage: {
      type: "string",
      default: "",
      validations: { required: true },
      storageKey: "Bjx3DRngWObo",
    },
    bountyPostMessageId: {
      type: "string",
      storageKey: "Go3vgI2kZXw5",
    },
    bountyPoster: { type: "json", storageKey: "SgnLpJ3-UP0h" },
    messagePoints: {
      type: "number",
      decimals: 0,
      storageKey: "liw4tIMIWa5x",
    },
    points: {
      type: "hasMany",
      children: { model: "point", belongsToField: "guild" },
      storageKey: "9TFI1Kykoq0N",
    },
    postChannel: {
      type: "json",
      validations: {
        required: true,
        run: ["api/models/guild/validations/validate-post-channel.ts"],
      },
      storageKey: "-L08_Ox4T1Lp",
    },
    postMessageId: { type: "string", storageKey: "-zgLlo1MYapW" },
    reactPoints: {
      type: "number",
      decimals: 0,
      storageKey: "ovNYSUb6tlQh",
    },
    referralPoints: {
      type: "number",
      decimals: 0,
      storageKey: "uRO051sp0VIu",
    },
    serverId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "mA2lrFxr1iUT",
    },
    ticketsChannel: {
      type: "json",
      validations: { required: true },
      storageKey: "CLmy8sdQNK6x",
    },
    ticketsHandler: {
      type: "json",
      validations: { required: true },
      storageKey: "r542tKimMDD5",
    },
    voicePoints: {
      type: "number",
      decimals: 0,
      storageKey: "RAj_B2o23GF0",
    },
  },
};
