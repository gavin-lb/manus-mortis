import { applyParams, save, ActionOptions, CreateApplicationFormActionContext } from "gadget-server";

/**
 * @param { CreateApplicationFormActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
