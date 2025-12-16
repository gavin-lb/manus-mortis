import {
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  EmbedBuilder,
  InteractionContextType,
  InteractionResponseType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { api } from "gadget-server";
import { formatSeconds, MM_COLOUR } from "../utils";

const SEPARATOR = "⎯".repeat(16);

export default {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Displays how many points you or another user has")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose points are shown (defaults to you)")
        .setRequired(false),
    )
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  execute: async (interaction: APIChatInputApplicationCommandInteraction) => {
    const options = interaction.data.options as
      | [{ name: "user"; type: ApplicationCommandOptionType.User; value: string }]
      | undefined;

    const userId = options?.[0]?.value ?? interaction.member!.user.id;

    const [record, guild] = await Promise.all([
      api.point.upsert({
        userId,
        on: ["userId"],
      }),
      api.guild.findByServerId(process.env.SERVER_ID!),
    ]);

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        embeds: [
          new EmbedBuilder()
            .setColor(MM_COLOUR)
            .setAuthor({ name: "Points Breakdown", iconURL: "https://i.imgur.com/LI0agMJ.png" })
            .setDescription(
              `${options ? `<@${userId}> has` : "You have"} ${record.points} point${
                Math.abs(record.points) == 1 ? "" : "s"
              }\n\u200B`,
            )
            .addFields(
              {
                name: "Source",
                value: [
                  SEPARATOR,
                  "Messages sent",
                  "Time in voice",
                  "Referrals",
                  "Reaction bounties",
                  SEPARATOR,
                ].join("\n"),
                inline: true,
              },
              {
                name: "Value",
                value: [
                  SEPARATOR,
                  record.messageCount,
                  formatSeconds(record.secondsInVoice ?? 0),
                  record.referralCount,
                  record.reactCount,
                  SEPARATOR,
                  "\u200f **:Total**",
                ].join("\n"),
                inline: true,
              },
              {
                name: "Points",
                value: [
                  SEPARATOR,
                  Math.floor(record.messageCount! / guild.messagePoints!),
                  Math.floor(record.secondsInVoice! / guild.voicePoints!),
                  record.referralCount! * guild.referralPoints!,
                  record.reactCount! * guild.reactPoints!,
                  SEPARATOR,
                  `**${record.points}**`,
                ].join("\n"),
                inline: true,
              },
            )
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      },
    };
  },
};
