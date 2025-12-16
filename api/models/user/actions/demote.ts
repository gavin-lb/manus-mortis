import { ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await api.internal.user.update(record.id, { roles: ["signed-in"] })
};

export const options: ActionOptions = {
  actionType: "custom",
};
