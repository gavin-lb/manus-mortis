import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run: ActionRun = async ({ params, record, api }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  await save(record);
  api.guild.editpost(record.guildId);
};

export const options: ActionOptions = {
  actionType: "create",
};
