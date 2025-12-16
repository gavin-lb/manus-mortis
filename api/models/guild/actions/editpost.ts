import { ActionOptions, EditpostGuildActionContext } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { memoize } from "lodash";
import { editMessage, getApplicationPost } from "/gadget/app/api/utils";

const memoizedEditMessage = memoize(editMessage, (...args) => JSON.stringify(args));

/**
 * @param { EditpostGuildActionContext } context
 */
export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);

  const { id: channelId } = record.postChannel as any;

  if (record.postMessageId && channelId) {
    memoizedEditMessage(channelId, record.postMessageId, await getApplicationPost());
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
};
