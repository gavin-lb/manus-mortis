import { sendMessage } from '/gadget/app/utils'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export const params = {
  channelId: { type: 'string' },
  roleId: { type: 'string' },
  title: { type: 'string' },
  body: { type: 'string' },
}

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
   sendMessage(params.channelId, '',
    params.title,
    params.body,
    [new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`role_opt_out ${params.roleId}`)
          .setLabel('Opt out')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('❌')
      ).toJSON()]
  )
};
