import { deleteRecord, ActionOptions, DeleteApplicationFormActionContext } from "gadget-server";

/**
 * @param { DeleteApplicationFormActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
