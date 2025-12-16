import { applyParams, save, ActionOptions, UpdatePointsActionContext } from "gadget-server"
import values from '../values.json' assert { type: 'json' }

/** @param { UpdatePointsActionContext } context */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record)
  record.value = Math.floor(record.message_count / values.message) +
    Math.floor(record.seconds_in_voice / values.voice) +
    values.referral * record.referral_count +
    values.react * record.react_count +
    values.training * record.training_count +
    record.other
  await save(record)
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
}
