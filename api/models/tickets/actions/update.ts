import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { buildTicketMessage, editChannel, editMessage } from "/gadget/app/api/utils";

export const run: ActionRun = async ({ params, record }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  if (params.tickets?.title || params.tickets?.body) {
    editMessage(record.threadId, record.messageId, buildTicketMessage(record, "Edited at"));
  }

  if (params.tickets?.title) {
    editChannel(record.threadId, {
      name: `✉️[@${record.ownerName}] ${record.title}`,
    });
  }

  await save(record);
};

export const options: ActionOptions = {
  actionType: "update",
};
