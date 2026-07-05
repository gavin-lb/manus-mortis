import { JSONValue } from "@gadget-client/manus-mortis";
import {
  TextInputStyle as DiscordTextInputStyle,
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  UserSelectMenuBuilder,
} from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { QuestionType, StringSelectOption, TextInputStyle } from "/gadget/app/api/types";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);

  const pages = [];
  const { numQuestions } = await api.application.findOne(record.id, {
    select: { numQuestions: true },
  });
  const numPages = Math.ceil(Number(numQuestions ?? 0) / 5) - 1;

  let questions = await api.question.findMany({
    first: 5,
    filter: { applicationId: { equals: record.id } },
    sort: { index: "Ascending" },
  });

  do {
    const modal = new ModalBuilder()
      .setCustomId(`submitApplication ${record.id} ${pages.length} ${numPages}`)
      .setTitle(
        numPages > 0 ? `${record.title} (${pages.length + 1} / ${numPages + 1})` : record.title,
      );

    for (const question of questions) {
      const label = new LabelBuilder().setLabel(question.title);

      if (question.description) {
        label.setDescription(question.description);
      }

      let component:
        | StringSelectMenuBuilder
        | TextInputBuilder
        | FileUploadBuilder
        | UserSelectMenuBuilder
        | undefined;

      switch (question.type) {
        case QuestionType.StringSelect:
          component = new StringSelectMenuBuilder().addOptions(
            ...(question.stringSelectOptions as unknown as StringSelectOption[]).map(
              (option, index) => {
                const optionBuilder = new StringSelectMenuOptionBuilder()
                  .setValue(String(index))
                  .setLabel(option.label);

                if (option.description) {
                  optionBuilder.setDescription(option.description);
                }

                if (option.emoji) {
                  optionBuilder.setEmoji({ name: option.emoji.name });
                }

                return optionBuilder;
              },
            ),
          );
          if (question.isMultiSelect) {
            component.setMinValues(question.min!).setMaxValues(question.max!);
          }
          if (question.placeholder) {
            component.setPlaceholder(question.placeholder);
          }
          label.setStringSelectMenuComponent(component);
          break;

        case QuestionType.TextInput:
          component = new TextInputBuilder().setStyle(
            {
              [TextInputStyle.Short]: DiscordTextInputStyle.Short,
              [TextInputStyle.Paragraph]: DiscordTextInputStyle.Paragraph,
            }[question.textInputStyle!],
          );
          if (question.placeholder) {
            component.setPlaceholder(question.placeholder);
          }
          if (question.isCharLimited) {
            component.setMinLength(question.min!).setMaxLength(question.max!);
          }
          label.setTextInputComponent(component);
          break;

        case QuestionType.FileUpload:
          component = new FileUploadBuilder();
          if (question.isMultiUpload) {
            component.setMinValues(question.min!).setMaxValues(question.max!);
          }
          label.setFileUploadComponent(component);
          break;

        case QuestionType.UserSelect:
          component = new UserSelectMenuBuilder().setPlaceholder("Search users");
          label.setUserSelectMenuComponent(component);
          break;
      }

      if (component) {
        component
          .setRequired(question.isRequired)
          .setId(question.index + 1)
          .setCustomId(question.id);
      }

      modal.addLabelComponents(label);
    }

    try {
      pages.push(modal.toJSON());
    } catch (err) {
      logger.error({ err }, "Application modal error");
      return;
    }
  } while (questions.hasNextPage && (questions = await questions.nextPage()));

  record.modalPages = pages as unknown as JSONValue;

  await save(record);
  api.guild.editpost(record.guildId);
};

export const options: ActionOptions = {
  actionType: "update",
};
