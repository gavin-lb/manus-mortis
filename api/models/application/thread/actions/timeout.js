import { applyParams, save, ActionOptions, TimeoutApplicationThreadActionContext } from "gadget-server";

/**
 * @param { TimeoutApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  if (record.status == 'open') {
    await api.application.thread.deny(record.id, { comments: 'Your application was automatically denied due to failure to complete.', handled_by: 'Manus Mortis Bot' })
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
