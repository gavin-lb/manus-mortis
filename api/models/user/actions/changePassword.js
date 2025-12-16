import { applyParams, save, ActionOptions, ChangePasswordUserActionContext } from "gadget-server";

// Powers form in web/routes/change-password.jsx

/**
 * @param { ChangePasswordUserActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
};

/**
 * @param { ChangePasswordUserActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: {},
};
