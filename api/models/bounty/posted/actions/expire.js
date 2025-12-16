import { applyParams, save, ActionOptions } from "gadget-server";
import { discordRequest } from '/gadget/app/utils'

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  params.posted.status = 'expired';

  // delete bounty message
  await discordRequest(`/channels/${record.bounty_channel_id}/messages/${record.bounty_message_id}`, { method: 'DELETE' });
  
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
