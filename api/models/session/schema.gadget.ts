import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://manus-mortis-v2.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "hy8Zv58ffJrF",
  fields: {
    accessToken: { type: "string", storageKey: "z8kT7dB4wFHz" },
    discordId: { type: "string", storageKey: "XVQuescErubQ" },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "PuuLJLQ1ib2U",
    },
    refreshToken: { type: "string", storageKey: "3dSwJ-CU-y47" },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "QL_notrAd82v",
    },
  },
};
