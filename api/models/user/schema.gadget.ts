import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "3JUM5UcX7qqI",
  fields: {
    avatar: {
      type: "url",
      storageKey: "xJ-5Qzi_zBTg",
      filterIndex: false,
      searchIndex: false,
    },
    discordId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "mr4kjt-6s2Iz",
      searchIndex: false,
    },
    globalName: {
      type: "string",
      storageKey: "o36AQcfDq9UP",
      filterIndex: false,
      searchIndex: false,
    },
    isManager: {
      type: "computed",
      sourceFile: "api/models/user/isManager.gelly",
      storageKey: "02KBLsUD-jdj",
    },
    roles: {
      type: "roleList",
      default: ["signed-in"],
      storageKey: "QJ2E5dbisSYj",
      searchIndex: false,
    },
    sessions: {
      type: "hasMany",
      children: { model: "session", belongsToField: "user" },
      storageKey: "ZIoLdiDk0Uln",
    },
    username: {
      type: "string",
      storageKey: "cUtTLxirRaoe",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
