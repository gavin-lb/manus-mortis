import { applyParams, save, ActionOptions, DefaultEmailTemplates, Config, VerifyEmailUserActionContext } from "gadget-server";

// Powers the sign up flow, this action is called from the email generated in /actions/sendVerifyEmail.js

/**
 * @param { VerifyEmailUserActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  // Applies new 'emailVerified' status to the user record and saves to database
  applyParams(params, record);
  await save(record);
  return {
    result: "ok"
  }
};

/**
 * @param { VerifyEmailUserActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  returnType: true,
  triggers: {},
};
