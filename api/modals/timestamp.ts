import {
  APIModalSubmitInteraction,
  APIModalSubmitStringSelectComponent,
  APIModalSubmitTextInputComponent,
  InteractionResponseType,
  MessageFlags,
  ModalSubmitLabelComponent,
} from "discord.js";
import { buildTimestamp, isTimestampOptions } from "../utils";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export default async (interaction: APIModalSubmitInteraction) => {
  const [
    {
      component: {
        values: [format],
      },
    },
    {
      component: {
        values: [timezone],
      },
    },
    {
      component: {
        values: [hour],
      },
    },
    {
      component: {
        values: [minute],
      },
    },
    {
      component: { value: date },
    },
  ] = interaction.data.components as [
    ModalSubmitLabelComponent & { component: APIModalSubmitStringSelectComponent },
    ModalSubmitLabelComponent & { component: APIModalSubmitStringSelectComponent },
    ModalSubmitLabelComponent & { component: APIModalSubmitStringSelectComponent },
    ModalSubmitLabelComponent & { component: APIModalSubmitStringSelectComponent },
    ModalSubmitLabelComponent & { component: APIModalSubmitTextInputComponent },
  ];
  const [year, numericMonth, day] = date.split("-");
  const month = MONTHS[Number(numericMonth) - 1];

  const options = { format, timezone, hour, minute, day, month, year };

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
};
