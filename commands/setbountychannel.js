import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType, 
  PermissionFlagsBits
} from 'discord.js'
import { getGuildRecord, sendMessage } from '../utils'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import dedent from 'dedent'

export default {
  data: new SlashCommandBuilder()
    .setName('setbountychannel')
    .setDescription('Sets current channel to be where new reaction bounties are posted')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  execute: async (interaction) => {
    const guildRecord = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(guildRecord.role_ids.ticket_handler)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Error: You must have the <@&${guildRecord.role_ids.ticket_handler}> role to execute this command`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    api.guild.update(guildRecord.id, { bounty_channel: interaction.channel.id })
    
    sendMessage(interaction.channel.id, '',
      '⚔️ Manus Mortis, To Arms! ⚔️', 
      dedent`
        **The battlefield of recruitment awaits, and our posts need your might!** 

        Every reaction a volley of rifle fire, a swing of the sword, a rumble of tanks - striking deep into the hearts of potential recruits!

        🫡 **Your Mission:** 🫡
        - 1️⃣ - Follow the reaction bounties posted in this channel
        - 2️⃣ - Deploy your reaction; swift and true as an arrow
        - 3️⃣ - Claim your bounty and revel in your glorious points!

        Our banners shall rise, our ranks shall swell, and our legacy shall echo through the halls of history. React now, for the glory of Manus Mortis!

        🛡️ **Victory is ours — one reaction at a time!** 🛡️
      `,
      [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`bounty_how_to`)
            .setLabel('How to claim a bounty')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰'),
          new ButtonBuilder()
            .setCustomId(`bounty_ping`)
            .setLabel('Ping me for new bounties')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚔'),
          new ButtonBuilder()
            .setCustomId(`bounty_stop_ping`)
            .setLabel('Stop pinging me')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🙅'),
        ).toJSON()]
    )
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Bounty channel set successfully`,
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }
}