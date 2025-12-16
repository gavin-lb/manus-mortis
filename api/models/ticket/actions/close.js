import { applyParams, save, ActionOptions, UpdateTicketActionContext } from "gadget-server";
import { closeTicket } from '/gadget/app/utils'

/**
 * @param { DeleteTicketActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await closeTicket(record)
  params.ticket = { status: 'closed' }
  applyParams(params, record)
  await save(record)
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
