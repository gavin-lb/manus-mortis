import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  // expires in 3 days
  params.posted.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  
  applyParams(params, record);
  await save(record);
  
  // schedule expiration
  api.enqueue(
    api.bounty.posted.expire,
    { id: record.id },
    { startAt: record.expiresAt } 
  );
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
