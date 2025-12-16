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

const CATEGORIES = {
  points: "Points",
  messageCount: "Messages Sent",
  secondsInVoice: "Time in Voice",
  referralCount: "Referrals",
  reactCount: "Reaction Bounties",
} as const;
const LENGTH = 15 as const;

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription(
      `Displays the top ${LENGTH} users with the most points (or another category, if specified)`,
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription(
          "(Optional) Choose which stat to rank by (if none given `Points` will be used)",
        )
        .setRequired(false)
        .addChoices(Object.entries(CATEGORIES).map(([value, name]) => ({ value, name }))),
    )
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  execute: async (interaction: APIChatInputApplicationCommandInteraction) => {
    const [{ value: field }] = (interaction.data.options as
      | [
          {
            name: "category";
            type: ApplicationCommandOptionType.String;
            value: keyof typeof CATEGORIES;
          },
        ]
      | undefined) ?? [{ value: "points" }];

    const category = CATEGORIES[field];
    const records = await api.point.findMany({
      first: LENGTH,
      sort: { [field]: "Descending" },
    });

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        embeds: [
          new EmbedBuilder()
            .setColor(MM_COLOUR)
            .setAuthor({
              name: `${category} Leaderboard`,
              iconURL: "https://i.imgur.com/LI0agMJ.png",
            })
            .setDescription(`Top ${LENGTH} users with the most ${category.toLowerCase()}\n\u200B`)
            .addFields(
              {
                name: "User",
                value: records.map((record, i) => `${i + 1}\u200B. <@${record.userId}>`).join("\n"),
                inline: true,
              },
              {
                name: category,
                value: records
                  .map((record) =>
                    field === "secondsInVoice" ? formatSeconds(record[field] ?? 0) : record[field],
                  )
                  .join("\n"),
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
