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


export default {
  data: new SlashCommandBuilder()
    .setName('setticketchannel')
    .setDescription('Sets current channel to be where new tickets are created')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  execute: async (interaction) => {
    const guildRecord = await getGuildRecord(interaction.guild.id)

    if (interaction.member.roles.includes(guildRecord.role_ids.ticket_handler)) {

      api.guild.update(guildRecord.id, { ticket_channel: interaction.channel.id })
      sendMessage(interaction.channel.id, '',
        'Welcome to Manus Mortis!',
        `        
        **If you want to join Anvil Empires**:
        Apply for Anvil Empires related roles with the button below.

        **If you want to join Foxhole**:
        Apply for Foxhole related roles with the button below.

        **If you want to join Warborne Above Ashes**:
        Apply for Warborne related roles with the button below.
        
        **If you require assistance with something else**:
        Please open a ticket with the button bellow.`,
        [new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`open_anvil_application`)
              .setLabel('Apply for Anvil Empires')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🛡'),
            new ButtonBuilder()
              .setCustomId(`open_foxhole_application`)
              .setLabel('Apply for Foxhole')
              .setStyle(ButtonStyle.Success)
              .setEmoji('🪖'),
            new ButtonBuilder()
              .setCustomId(`open_warborne_application`)
              .setLabel('Apply for Warborne')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🚀'),
            new ButtonBuilder()
              .setCustomId(`open_new_ticket`)
              .setLabel('Open a ticket')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('📫')
          ).toJSON()]
      )
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Ticket channel set successfully`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    } else {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Error: You must have the <@&${guildRecord.role_ids.ticket_handler}> role to execute this command`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }
  }
}