import { applyParams, save, ActionOptions } from "gadget-server";

export const params = {
  options: {
    type: "array",
    items: {
      type: "string"
    }
  }
};

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  if (record.selected_options.length == 0) {
    record.selected_options.push("default")
  }
  
  record.selected_options.push(...params.options)
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
