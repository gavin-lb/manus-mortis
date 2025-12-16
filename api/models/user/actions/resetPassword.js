import { applyParams, save, ActionOptions, ResetPasswordUserActionContext } from "gadget-server";

// Powers form in web/routes/reset-password.jsx

/**
 * @param { ResetPasswordUserActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
  return {
    result: "ok"
  }
};

/**
 * @param { ResetPasswordUserActionContext } context
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
