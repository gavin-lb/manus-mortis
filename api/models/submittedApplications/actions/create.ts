import {
  ActionRowBuilder,
  APIModalSubmission,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  ModalSubmitComponent,
  ModalSubmitLabelComponent,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { StringSelectOption } from "../../../types";
import { createThread, MM_COLOUR, sendMessage } from "/gadget/app/api/utils";

const NO_RESPONSE = "No response given";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  const [applicationRecord, questionRecords] = await Promise.all([
    api.application.findById(record.applicationId),
    api.question.findMany({
      filter: { applicationId: { equals: record.applicationId } },
    }),
  ]);
  const questionMap = Object.fromEntries(
    questionRecords.map((question) => [question.id, question]),
  );

  const { id: channelId } = applicationRecord.channel as { id: string; name: string };
  const { id: handlerRoleId } = applicationRecord.handlerRole as { id: string; name: string };
  let emojiName: string | undefined;
  if (applicationRecord.emoji) {
    emojiName = (applicationRecord.emoji as { id: string; name: string }).name;
  }

  const roles = (applicationRecord.roles as { name: string; id: string }[]).map(({ id }) => id);
  const data = record.data as any as APIModalSubmission;
  const components = data.components as ModalSubmitLabelComponent[];

  const answers = components.map(({ component }, index) => {
    const answer = component as ModalSubmitComponent;
    const question = questionMap[component.custom_id];
    const container = new ContainerBuilder()
      .setAccentColor(MM_COLOUR)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### Q${index + 1}. ${question.title}`),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
      );

    switch (answer.type) {
      case ComponentType.TextInput:
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            answer.value && answer.value.length > 0 ? answer.value : NO_RESPONSE,
          ),
        );
        break;

      case ComponentType.StringSelect:
        const options = question.stringSelectOptions as any as StringSelectOption[];
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            answer.values
              .map((answer) => {
                const option = options[Number(answer)];
                roles.push(...option.roles);
                return ` - ${option.label}`;
              })
              .join("\n"),
          ),
        );
        break;

      case ComponentType.FileUpload:
        if (answer.values.length > 0) {
          const attachments = answer.values.map(
            (snowflake) => data.resolved!.attachments![snowflake],
          );

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              ...attachments.map((attachment) =>
                new MediaGalleryItemBuilder().setURL(attachment.url),
              ),
            ),
          );
        } else {
          container.addTextDisplayComponents(new TextDisplayBuilder().setContent(NO_RESPONSE));
        }
        break;

      case ComponentType.UserSelect:
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            answer.values
              .map(async (id) => {
                if (id === record.ownerId) return "Nice try, but you cannot refer yourself";

                const pointRecord = await api.internal.point.upsert({
                  userId: id,
                  _atomics: {
                    referralCount: { increment: 1 },
                  },
                  on: ["userId"],
                });
                api.point.computePoints(pointRecord.id);
                return `<@${id}>`;
              })
              .join(", "),
          ),
        );
    }

    return container.toJSON();
  });

  const thread = await createThread(channelId, {
    name: `${emojiName ?? "✉️"}[@${record.ownerName}] ${applicationRecord.title}`,
    type: ChannelType.PrivateThread,
  });

  sendMessage(thread.id, {
    flags: MessageFlags.IsComponentsV2,
    allowed_mentions: { roles: [handlerRoleId], users: [record.ownerId] },
    components: [
      new TextDisplayBuilder().setContent(`<@${record.ownerId}><@&${handlerRoleId}>`).toJSON(),
      ...answers,
      new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setCustomId("handleApplication")
            .setEmoji({ name: "🔧" })
            .setStyle(ButtonStyle.Secondary),
        )
        .toJSON(),
    ],
  });

  record.roles = roles;
  record.threadId = thread.id;
  record.channelId = channelId;

  await save(record);
};

export const options: ActionOptions = {
  actionType: "create",
};
