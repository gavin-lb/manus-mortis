import { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, RoleSelectMenuBuilder, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api, logger } from 'gadget-server'
import { discordRequest } from '/gadget/app/utils'

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Assign Poll Roles')
  	.setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  execute: async (interaction) => {
    logger.info({ interaction }, 'assign poll roles interaction')
    
    const guild = await api.guild.findFirst({
      filter: {
        bounty_channel: {
          notEquals: null
        }
      }
    })
    
    const guild_member = await discordRequest(`/guilds/${guild.guild_id}/members/${interaction.member.user.id}`, { method: 'GET' })
    
    if (!guild_member.roles.includes(guild.role_ids.ticket_handler)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Oops! Only <@${guild.role_ids.ticket_handler}> can use this command', 
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }
    
    const [message_id, message] = Object.entries(interaction.data.resolved.messages)[0]

    if (!message.poll) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Oops! This command can only be used on polls!', 
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }
  
    const record = await api.assign_poll_role.create({
      channel_id: interaction.channel.id,
      message_id,
    })

    const options = message.poll.answers.map(answer => 
      new StringSelectMenuOptionBuilder()
				.setLabel(answer.poll_media.text)
  			.setDescription(`Answer ${answer.answer_id}`)
				.setValue(`${answer.answer_id}`)
    )
    
    const select = new ActionRowBuilder()
			.addComponents(
        new StringSelectMenuBuilder()
  			.setCustomId(`assign_poll_roles_answer ${record.id}`)
  			.setPlaceholder('Select answer given')
  			.addOptions(...options)
      )
    
    const roles = new ActionRowBuilder()
			.addComponents(new RoleSelectMenuBuilder()
        .setCustomId(`assign_poll_roles_role ${record.id}`)
        .setPlaceholder('Select role to assign (type to search)')
      )

    const confirm = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`assign_poll_roles_confirm ${record.id}`)
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
      )

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'This command will assign the selected role to all users who voted for the selected answer',
        components: [roles, select, confirm],
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }
}