import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { editChannel } from "/gadget/app/api/utils";

export const params = {};

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  const applicationRecord = await api.application.findById(record.applicationId);

  record.status = "withdrawn";

  editChannel(record.threadId, {
    name: `❌Withdrawn[@${record.ownerName}] ${applicationRecord.title}`,
    archived: true,
    locked: true,
  });

  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
