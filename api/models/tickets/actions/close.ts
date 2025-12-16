import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { buildTicketMessage, editChannel, editMessage } from "/gadget/app/api/utils";

export const params = {
  name: { type: "string" },
};

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);
  record.status = "closed";
  editChannel(record.threadId, {
    name: `✅Resolved[@${record.ownerName}] ${record.title}`,
    archived: true,
    locked: true,
  });
  editMessage(record.threadId, record.messageId, {
    ...buildTicketMessage(record, `Closed by @${params.name} at`),
    components: [],
  });
  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
