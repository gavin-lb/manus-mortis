import { applyParams, save, ActionOptions } from "gadget-server";
import { discordRequest, chunks, buildPollComponents } from '/gadget/app/utils'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { InteractionResponseFlags } from 'discord-interactions'

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record)
 
  const components = buildPollComponents(record.title, record.options, record.id)
    
  chunks(components, 5).forEach((chunk, i) => {
    discordRequest(`/webhooks/${process.env.APP_ID}/${record.tokens[i]}/messages/@original`, { method: 'PATCH', body: { components: chunk } })
  })
  
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
