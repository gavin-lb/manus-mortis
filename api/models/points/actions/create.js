import { applyParams, save, ActionOptions, CreatePointsActionContext } from "gadget-server";

/** @param { CreatePointsActionContext } context */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
