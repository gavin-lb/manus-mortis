import { applyParams, save, ActionOptions, UpdateApplicationAnswerActionContext } from "gadget-server";

/**
 * @param { UpdateApplicationAnswerActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
