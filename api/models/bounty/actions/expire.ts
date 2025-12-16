import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { deleteMessage } from "/gadget/app/api/utils";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);

  record.status = "expired";

  if (record.bountyChannelId && record.bountyMessageId) {
    deleteMessage(record.bountyChannelId, record.bountyMessageId);
  }

  await save(record);
};

export const options: ActionOptions = {
  actionType: "update",
};
