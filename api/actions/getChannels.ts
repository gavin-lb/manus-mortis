import { discordRequest } from "/gadget/app/api/utils";

export const run: ActionRun = async () => {
  return await discordRequest(`/guilds/${process.env.SERVER_ID!}/channels`, {
    method: "GET",
  });
};
