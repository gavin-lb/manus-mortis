import { applyParams, save, ActionOptions, UpdateApplicationThreadActionContext } from "gadget-server";
import { discordRequest } from '/gadget/app/utils'

/**
 * @param { UpdateApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  params.thread.status = 'withdrawn'

  // Update thread title
  discordRequest(`/channels/${record.thread_id}`, {
    method: 'PATCH', body: {
      name: `❌Withdrawn: @${record.owner.global_name ?? record.owner.username} - ${(await api.application.form.findOne(record.form)).title}`,
      archived: true,
      locked: true
    }
  })

  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
