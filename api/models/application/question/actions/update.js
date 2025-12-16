import { applyParams, save, ActionOptions, UpdateApplicationQuestionActionContext } from "gadget-server";

/**
 * @param { UpdateApplicationQuestionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
