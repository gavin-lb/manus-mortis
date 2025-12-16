import { applyParams, save, ActionOptions, SignInUserActionContext } from "gadget-server";

// Powers form in web/routes/sign-in.jsx

/**
 * @param { SignInUserActionContext } context
 */
export async function run({ params, record, logger, api, session }) {
  applyParams(params, record);
  record.lastSignedIn = new Date();
  await save(record);
  // Assigns the signed-in user to the active session
  session?.set("user", { _link: record.id });
};

/**
 * @param { SignInUserActionContext } context
 */
export async function onSuccess({ params, record, logger, api, session }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: {},
};
