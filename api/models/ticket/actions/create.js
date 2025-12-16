import { applyParams, save, ActionOptions, CreateTicketActionContext } from "gadget-server";

/**
 * @param { CreateTicketActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
