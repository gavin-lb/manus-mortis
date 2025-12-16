import { deleteRecord, ActionOptions, DeleteApplicationAnswerActionContext } from "gadget-server";

/**
 * @param { DeleteApplicationAnswerActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
