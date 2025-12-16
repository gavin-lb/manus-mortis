import { applyParams, save, ActionOptions, CreateApplicationAnswerActionContext } from "gadget-server";

/**
 * @param { CreateApplicationAnswerActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
