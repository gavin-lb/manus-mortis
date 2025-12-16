import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export function buildPollComponents(title, options, record_id) {  
  const titleRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`create_poll_title ${record_id}`)
        .setLabel(` \u200B \u200B ${(title.slice(0, 65) + (title.length > 65? '...' : '')).padEnd(60, '\u2003\u200B')}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📒'),
    )
  
  const optionRows = options.map((option, i) => 
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`create_poll_option ${record_id} ${i}`)
          .setLabel(`\u1CBC\u1CBC${i+1}.\u1CBC\u1CBC${option.padEnd(50, '\u1CBC')}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✏️'),
        new ButtonBuilder()
          .setCustomId(`create_poll_option_up ${record_id} ${i}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔼'),
      new ButtonBuilder()
          .setCustomId(`create_poll_option_down ${record_id} ${i}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔽'),
      new ButtonBuilder()
          .setCustomId(`create_poll_option_remove ${record_id} ${i}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❌')
      )
  )
  
  const confirmRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`create_poll_add_option ${record_id}`)
        .setLabel('Add option')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId(`create_poll ${record_id}`)
        .setLabel('Create')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
    )

  return [titleRow, ...optionRows, confirmRow]
}