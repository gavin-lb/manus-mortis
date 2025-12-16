import { applyParams, save, ActionOptions, ReminderApplicationThreadActionContext } from "gadget-server";
import { sendMessage } from '/gadget/app/utils'

/**
 * @param { ReminderApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  if (record.status == 'open') {
    // Send reminder to user
    await sendMessage(
      record.thread_id,
      `<@${record.owner.id}> Please complete your application. It will be automatically denied if not completed within 24 hours of opening.`,
    )
    logger.info(`Sent reminder to ${record.owner.global_name}`)
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
};
