import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://manus-mortis.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "-1kdu-ZHj1Ii",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "b7G31oJbJnsv",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "5WSISS545dSG",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "2vOL0_QLTdmr",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "ZXjBQmos0C_p",
    },
    firstName: { type: "string", storageKey: "INMlg77oLBaL" },
    googleImageUrl: { type: "url", storageKey: "SgFJRar6RA0A" },
    googleProfileId: { type: "string", storageKey: "MVrMDu02Gi_Z" },
    lastName: { type: "string", storageKey: "clD0aC7dn-Dy" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "OE7PO-IamfSX",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "fRgX08Lh5Ag_",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "j88mKeXw3K_h",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "k8FrHaKyqOId",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "VLEfSOJKtmgl",
    },
    sessions: {
      type: "hasMany",
      children: { model: "session", belongsToField: "user" },
      storageKey: "4xBOOyL5MtWv",
    },
  },
};
