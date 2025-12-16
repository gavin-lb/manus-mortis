import {
  APIChatInputApplicationCommandInteraction,
  APISelectMenuOption,
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  InteractionContextType,
  InteractionResponseType,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputStyle,
} from "discord.js";
import { buildTimestamp, isTimestampOptions } from "../utils";

const formatOptions = [
  { label: "Short time", description: "(04:20 PM)", value: "t" },
  { label: "Long time", description: "(04:20:00 PM)", value: "T" },
  { label: "Short date", description: "(20/04/2025)", value: "d" },
  { label: "Long date", description: "(20 April 2025)", value: "D" },
  { label: "Long date with short time", description: "(20 April 2025 at 04:20 PM)", value: "f" },
  {
    label: "Long date with day of the week and short time",
    description: "(Saturday, 20 April 2025 at 04:20 PM)",
    value: "F",
  },
  { label: "Relative", description: "(in 2 days)", value: "R" },
];

const timezoneOptions = [
  { label: "Pacific Standard Time", description: "PST (UTC-8)", value: "-8" },
  { label: "Pacific Daylight Time", description: "PDT (UTC-7)", value: "-7" },
  { label: "Central Standard Time", description: "CST (UTC-6)", value: "-6" },
  { label: "Central Daylight Time", description: "CDT (UTC-5)", value: "-5" },
  { label: "Eastern Standard Time", description: "EST (UTC-5)", value: "-05" },
  { label: "Eastern Daylight Time", description: "EDT (UTC-4)", value: "-4" },
  { label: "Greenwich Mean Time", description: "GMT (UTC+0)", value: "+0", default: true },
  { label: "British Summer Time", description: "BST (UTC+1)", value: "+1" },
  { label: "Central European Time", description: "CET (UTC+1)", value: "+01" },
  { label: "Central European Summer Time", description: "CEST (UTC+2)", value: "+2" },
];

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${String(i).padStart(2, "0")}:00`,
  description: `(${i % 12 || 12} ${i < 12 ? "am" : "pm"})`,
  value: String(i).padStart(2, "0"),
}));

const modalOptionsToCommandOptions = (options: APISelectMenuOption[]) =>
  options.map(({ label, description, value }) => ({
    name: `${label} ${description}`,
    value,
  }));

export default {
  data: new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Creates a discord timestamp")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("modal")
        .setDescription("Creates a discord timestamp with a modal for input"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Creates a discord timestamp with command options for input")
        .addStringOption((option) =>
          option
            .setName("format")
            .setRequired(true)
            .setDescription("The format of the timestamp")
            .addChoices(modalOptionsToCommandOptions(formatOptions)),
        )
        .addStringOption((option) =>
          option
            .setName("timezone")
            .setRequired(true)
            .setDescription("The timezone of the source time")
            .addChoices(modalOptionsToCommandOptions(timezoneOptions)),
        )
        .addStringOption((option) =>
          option
            .setName("hour")
            .setRequired(true)
            .setDescription("The hour of the source time")
            .addChoices(modalOptionsToCommandOptions(hourOptions)),
        )
        .addIntegerOption((option) =>
          option
            .setName("minute")
            .setRequired(false)
            .setDescription("The minute of the source time (defaults to 0)")
            .setMinValue(0)
            .setMaxValue(59),
        )
        .addIntegerOption((option) =>
          option
            .setName("seconds")
            .setRequired(false)
            .setDescription("The seconds of the source time (defaults to 0)")
            .setMinValue(0)
            .setMaxValue(59),
        )
        .addIntegerOption((option) =>
          option
            .setName("day")
            .setRequired(false)
            .setDescription("The day of the source date (defaults to current day)")
            .setMinValue(1)
            .setMaxValue(31),
        )
        .addStringOption((option) =>
          option
            .setName("month")
            .setRequired(false)
            .setDescription("The month of the source date (defaults to current month)")
            .addChoices(
              ...Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2000, i);
                return {
                  name: date.toLocaleString("en-GB", { month: "long" }),
                  value: date.toLocaleString("en-GB", { month: "short" }),
                };
              }),
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName("year")
            .setRequired(false)
            .setDescription("The year of the source date (defaults to current year)")
            .setMinValue(1970)
            .setMaxValue(2037),
        ),
    )
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ),
  execute: (interaction: APIChatInputApplicationCommandInteraction) => {
    if (!interaction.data.options) return;
    const [subcommand] = interaction.data.options;
    if (subcommand.type !== ApplicationCommandOptionType.Subcommand) return;

    switch (subcommand.name) {
      case "modal":
        const hour = new Date().getHours();
        return {
          type: InteractionResponseType.Modal,
          data: new ModalBuilder()
            .setCustomId("timestamp")
            .setTitle("Timestamp")
            .addLabelComponents(
              new LabelBuilder()
                .setLabel("Format")
                .setStringSelectMenuComponent((builder) =>
                  builder
                    .addOptions(formatOptions)
                    .setCustomId("format")
                    .setPlaceholder("Select the format of the timestamp"),
                ),
            )
            .addLabelComponents(
              new LabelBuilder()
                .setLabel("Timezone")
                .setStringSelectMenuComponent(
                  new StringSelectMenuBuilder()
                    .addOptions(timezoneOptions)
                    .setCustomId("timezone")
                    .setPlaceholder("Select the timezone of the input time"),
                ),
            )
            .addLabelComponents(
              new LabelBuilder().setLabel("Hour").setStringSelectMenuComponent((builder) =>
                builder
                  .addOptions(
                    ...hourOptions.map((option, index) => ({ ...option, default: index === hour })),
                  )
                  .setCustomId("hour")
                  .setPlaceholder("Select the hour of the input time"),
              ),
            )
            .addLabelComponents(
              new LabelBuilder().setLabel("Minute").setStringSelectMenuComponent((builder) =>
                builder
                  .addOptions(
                    ...Array.from({ length: 12 }, (_, i) => ({
                      label: `XX:${String(i * 5).padStart(2, "0")}`,
                      value: String(i * 5).padStart(2, "0"),
                      default: i === 0,
                    })),
                  )
                  .setCustomId("minute"),
              ),
            )
            .addLabelComponents(
              new LabelBuilder()
                .setLabel("Date (YYYY-MM-DD)")
                .setTextInputComponent((builder) =>
                  builder
                    .setCustomId("date")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Enter in format YYYY-MM-DD")
                    .setValue(new Date().toISOString().slice(0, 10)),
                ),
            )
            .toJSON(),
        };

      case "command":
        if (!subcommand.options) return;

        const options = Object.fromEntries(
          subcommand.options.map((option) => [option.name, option.value]),
        );

        if (isTimestampOptions(options)) {
          return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: buildTimestamp(options),
              flags: MessageFlags.Ephemeral,
            },
          };
        } else {
          throw new Error("Timestamp command options are not of type TimestampOptions");
        }
    }
  },
};
