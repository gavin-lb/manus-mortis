import { applyParams, save, ActionOptions, UpdateApplicationFormActionContext } from "gadget-server";

/**
 * @param { UpdateApplicationFormActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
