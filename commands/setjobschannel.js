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
    .setName('setjobschannel')
    .setDescription('Sets current channel to be where job applications are created')
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

    api.guild.update(guildRecord.id, { jobs_channel: interaction.channel.id })

    sendMessage(interaction.channel.id, '', 
      '🏅 Contingent Jobs 🏅', 
      dedent`
        **These are temporary roles that apply on a per-test basis.
        Eligibility for each job is determined by clan rank.**

        ### __**Civilian Jobs:**__  
        - **🏛️ Mayor**: 
          - Leads and organizes a homestead
          - Manages building, farming, and local defense
          - Keeps things running smoothly and connects the homestead with the wider region
        - **🧙 Mentor**: 
          - Supports new and returning players by teaching game basics, answering questions, and helping them get settled
          - Friendly guides who make the early experience smoother and more welcoming
        - **⚖️ Magistrate**: 
          - Leads group tasks like lumber runs, mining expeditions, and other homestead projects
          - Helps coordinate settlers, keep things organized, and ensures tasks are completed efficiently
        - **🗡️ Quartermaster**: 
          - Manages supplies and storage for all [MM] homesteads
          - Keeps track of resources, organizes stockpiles, and ensures everyone has what they need for building, farming, and defense

        ### __**Military Jobs:**__  
        - **👑 General**: 
          - Leads, plans, and executes entire operations
          - Oversees the various companies (archer team, infantry team, siege engine team, etc.)
          - Collaborates with external partners outside of [MM]
        - **⚔️ Captain**: 
          - Fully in charge of one company (archers, infantry, siege, etc.)
          - Makes on-the-spot strategic decisions
        - **🛡️ Lieutenant**: 
          - Assistant to the Captain
          - Second-in-command
        - **🎖️ Sergeant**: 
          - Ensures orders from superiors are followed
          - No major strategic thinking required but can make minor real-time decisions


        ✏️ **Apply for a job with the relevant button below.**
      `,
      [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`jobs_civilian`)
            .setLabel('Apply for Civilian Jobs')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏛️'),
          new ButtonBuilder()
            .setCustomId(`jobs_military`)
            .setLabel('Apply for Military Jobs')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⚔️')
        ).toJSON()
      ]
    )

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Jobs channel set successfully`,
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }
}