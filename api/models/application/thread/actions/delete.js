import { deleteRecord, ActionOptions, DeleteApplicationThreadActionContext } from "gadget-server";

/**
 * @param { DeleteApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
