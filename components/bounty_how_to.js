import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { EmbedBuilder } from 'discord.js'

export default async (interaction, question_id) => {
  const embed = new EmbedBuilder()
  	.setColor(0x5865F2)
  	.setAuthor({ name: 'How To Claim Bounties', iconURL: 'https://i.imgur.com/LI0agMJ.png' })
  	.setDescription('**Follow these 4 simple steps to lend your reaction to our noble cause and claim your glorious points!**')
  	.addFields(
  		{ name: '1️⃣ (Once only) Add Manus Mortis Bot as a User App to your Discord account', value: 'You only need to do this step the first time you claim a bounty, not every time.\nClick on the name/user of Manus Mortis Bot, press the `+ Add App` button and then the `Authorize` button on the popup.\n\u200B', },
      { name: '2️⃣ Follow a link from a posted bounty', value: 'Click on one of the links to a reaction bounty post listed in this channel.\nYou will need to be a member of the server which the bounty is in, so feel free to ask for a link to and make sure you join the offical Anvil Empires discord, etc.\n\u200B',  },
      { name: '3️⃣ React to the post ', value: 'The most important part! Click the icon below the post to react to it!\n\u200B', },
      { name: '4️⃣ Right click, then `Apps > Claim Bounty`', value: 'Use the Manus Mortis Bot User App to claim your bounty.\nSince you added Manus Mortis Bot as a User App to your discord account in Step 1, you can now right click the post you reacted to and will see a `Claim Bounty` option under the `Apps` section of your right click menu.\nSimply press this and revel in your points!\n\u200B', },
  	)
  	.setImage('https://i.imgur.com/DvEDHdC.png')
    .setFooter({text: 'Bonus Tip: check back regularly for new bounties or use the "⚔️Ping me for new bounties" button above to get pinged every time a new bounty is posted!'})

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      embeds: [embed]
    }
  }
}