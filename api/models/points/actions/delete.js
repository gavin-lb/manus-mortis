import { deleteRecord, ActionOptions, DeletePointsActionContext } from "gadget-server";

/** @param { DeletePointsActionContext } context */
export const run = async ({ params, record, logger, api, connections }) => {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
