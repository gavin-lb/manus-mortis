import {
  ActionRowBuilder,
  APIInteractionDataResolved,
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
import { createThread, escapeCsvField, MM_COLOUR, sendMessage } from "/gadget/app/api/utils";

const NO_RESPONSE = "No response given";

export const run: ActionRun = async ({ params, record, api, logger }) => {
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

  const { id: channelId } = applicationRecord.channel as {
    id: string;
    name: string;
  };
  const { id: handlerRoleId } = applicationRecord.handlerRole as {
    id: string;
    name: string;
  };
  let emojiName: string | undefined;
  if (applicationRecord.emoji) {
    emojiName = (applicationRecord.emoji as { id: string; name: string }).name;
  }

  const roles = ((applicationRecord.roles ?? []) as { name: string; id: string }[]).map(
    (role: { name: string; id: string }) => role.id,
  );
  const removeRoles = ((applicationRecord.removeRoles ?? []) as { name: string; id: string }[]).map(
    (role: { name: string; id: string }) => role.id,
  );

  const data = record.data as unknown as APIModalSubmission;
  const components = data.components as ModalSubmitLabelComponent[];
  let answersString = "";

  const answers = await Promise.all(
    components.map(async ({ component }, index) => {
      const answer = component as ModalSubmitComponent;
      const question = questionMap[component.custom_id];
      const questionTitle = `Q${index + 1}. ${question.title}`;
      const container = new ContainerBuilder()
        .setAccentColor(MM_COLOUR)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${questionTitle}`))
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        );

      let answerString;

      switch (answer.type) {
        case ComponentType.TextInput:
          answerString = answer.value && answer.value.length > 0 ? answer.value : NO_RESPONSE;

          container.addTextDisplayComponents(new TextDisplayBuilder().setContent(answerString));
          break;

        case ComponentType.StringSelect: {
          const options = question.stringSelectOptions as unknown as StringSelectOption[];
          answerString = answer.values
            .map((answer) => {
              const option = options[Number(answer)];
              roles.push(...option.roles);
              return ` - ${option.label}`;
            })
            .join("\n");

          container.addTextDisplayComponents(new TextDisplayBuilder().setContent(answerString));
          break;
        }

        case ComponentType.FileUpload:
          if (answer.values.length > 0) {
            const attachments = answer.values.map(
              (snowflake) => data.resolved!.attachments![snowflake],
            );

            answerString = attachments.map((attachment) => ` - ${attachment.url}`).join("\n");

            container.addMediaGalleryComponents(
              new MediaGalleryBuilder().addItems(
                ...attachments.map((attachment) =>
                  new MediaGalleryItemBuilder().setURL(attachment.url),
                ),
              ),
            );
          } else {
            answerString = NO_RESPONSE;
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(answerString));
          }
          break;

        case ComponentType.UserSelect:
          answerString = answer.values
            ? (answer.values as Array<string>)
                .map((id) => (data.resolved as APIInteractionDataResolved).users![id].username)
                .join(", ")
            : NO_RESPONSE;

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              answer.values.length > 0
                ? (
                    await Promise.all(
                      answer.values.map(async (id) => {
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
                      }),
                    )
                  ).join(", ")
                : NO_RESPONSE,
            ),
          );
          break;

        default:
          answerString = NO_RESPONSE;
      }

      answersString += `${escapeCsvField(`${questionTitle}: ${escapeCsvField(answerString)}`)}, `;
      return container.toJSON();
    }),
  );

  const thread = await createThread(channelId, {
    name: `${emojiName ?? "✉️"}[@${record.ownerName}] ${applicationRecord.title}`,
    type: ChannelType.PrivateThread,
  });

  if (answers.length > 9) {
    await sendMessage(thread.id, {
      flags: MessageFlags.IsComponentsV2,
      allowed_mentions: { roles: [handlerRoleId], users: [record.ownerId] },
      components: [
        new TextDisplayBuilder().setContent(`<@${record.ownerId}><@&${handlerRoleId}>`).toJSON(),
        ...answers.slice(0, 9),
      ],
    });
    let remainingAnswers = answers.slice(9);
    while (remainingAnswers.length > 9) {
      await sendMessage(thread.id, {
        flags: MessageFlags.IsComponentsV2,
        components: [...remainingAnswers.slice(0, 9)],
      });
      remainingAnswers = remainingAnswers.slice(9);
    }
    sendMessage(thread.id, {
      flags: MessageFlags.IsComponentsV2,
      components: [
        ...remainingAnswers,
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
  } else {
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
  }

  logger.debug({ answers, answersString }, "Submitted application answers");
  record.answers = answersString;

  record.status = "open";
  record.roles = roles;
  record.removeRoles = removeRoles;
  record.threadId = thread.id;
  record.channelId = channelId;

  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
