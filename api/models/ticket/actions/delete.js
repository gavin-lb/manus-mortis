import { deleteRecord, ActionOptions, DeleteTicketActionContext } from "gadget-server";
import { closeTicket } from '/gadget/app/utils'

/**
 * @param { DeleteTicketActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await closeTicket(record)
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
