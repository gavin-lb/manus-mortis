import { type APIGuildMember } from "discord.js";
import { discordRequest } from '/gadget/app/api/utils'

export const run: ActionRun = async (): Promise<APIGuildMember[]> => {
  const members: APIGuildMember[] = []

  let page
  do {
    page = await discordRequest(
      `/guilds/${process.env.SERVER_ID}/members?limit=1000&after=${members?.at(-1)?.user.id ?? 0}`,
      { method: "GET" }
    ) as APIGuildMember[]
    members.push(...page)
  } while (page.length == 1000)

  return members
};