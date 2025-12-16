import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  const { id } = await api.guild.findByServerId(process.env.SERVER_ID!);
  applyParams({ point: { guild: { _link: id } } }, record);
  await save(record);
  api.point.computePoints(record.id);
};

export const options: ActionOptions = {
  actionType: "create",
};
