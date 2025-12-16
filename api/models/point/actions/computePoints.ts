import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);

  const { reactPoints, referralPoints, messagePoints, voicePoints } =
    await api.guild.findByServerId(process.env.SERVER_ID!);
  const { reactCount, referralCount, messageCount, secondsInVoice } = record;
  record.points =
    (reactPoints ?? 1) * (reactCount ?? 0) +
    (referralPoints ?? 1) * (referralCount ?? 0) +
    Math.floor((messageCount ?? 0) / (messagePoints ?? 50)) +
    Math.floor((secondsInVoice ?? 0) / (60 * (voicePoints ?? 60)));

  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
