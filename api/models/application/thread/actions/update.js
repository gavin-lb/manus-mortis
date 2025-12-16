import { applyParams, save, ActionOptions, UpdateApplicationThreadActionContext } from "gadget-server";

/**
 * @param { UpdateApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
