import { deleteRecord, ActionOptions, DeleteApplicationQuestionActionContext } from "gadget-server";

/**
 * @param { DeleteApplicationQuestionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
