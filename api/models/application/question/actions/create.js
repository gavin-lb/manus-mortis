  import { applyParams, save, ActionOptions, CreateApplicationQuestionActionContext } from "gadget-server";

/**
 * @param { CreateApplicationQuestionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
