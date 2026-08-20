import { JSONValue } from "@gadget-client/manus-mortis";
import { APIInteractionDataResolved, ComponentType } from "discord.js";
import { logger } from "gadget-server";
import { escapeCsvField } from "../utils";

const NO_RESPONSE = "No response given" as const;

function convertDataToAnswers(
  data: JSONValue,
  questionsMap: Record<
    string,
    {
      id: string;
      title: string;
      stringSelectOptions: JSONValue | null;
    }
  >,
) {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    !("components" in data) ||
    !Array.isArray(data.components)
  ) {
    logger.error({ data }, "Invalid data format");
    return "";
  }

  return data.components
    .map((component, index) => {
      if (
        typeof component !== "object" ||
        component === null ||
        !("component" in component) ||
        typeof component.component !== "object" ||
        component.component === null ||
        (!("value" in component.component) &&
          !("values" in component.component && Array.isArray(component.component.values))) ||
        !("custom_id" in component.component) ||
        !("type" in component.component) ||
        typeof component.component.custom_id !== "string"
      ) {
        logger.error({ component }, "Invalid component format");
        return "";
      }

      const question = questionsMap[component.component.custom_id];

      if (!question) {
        logger.error({ component }, "Unknown question custom_id");
        return "";
      }

      let answer: string;
      switch (component.component.type) {
        case ComponentType.StringSelect:
          answer =
            (component.component.values as Array<string>)
              .map(
                (idx) =>
                  (question.stringSelectOptions as Array<{ label: string }>)[Number(idx)].label,
              )
              .join(", ") ?? NO_RESPONSE;
          break;

        case ComponentType.TextInput:
          answer = (component.component.value as string) ?? NO_RESPONSE;
          break;

        case ComponentType.UserSelect:
          answer =
            (component.component.values as Array<string>)
              .map((id) => (data.resolved as APIInteractionDataResolved).users![id].username)
              .join(", ") ?? NO_RESPONSE;
          break;

        case ComponentType.FileUpload:
          answer =
            (component.component.values as Array<string>)
              .map((id) => (data.resolved as APIInteractionDataResolved).attachments![id].url)
              .join(", ") ?? NO_RESPONSE;
          break;

        default:
          answer = NO_RESPONSE;
      }

      return escapeCsvField(`Q${index + 1}. ${question.title}: ${answer}`);
    })
    .join(", ");
}

export const run: ActionRun = async ({ api }) => {
  const questions = await api.question.findMany({
    select: {
      id: true,
      title: true,
      stringSelectOptions: true,
    },
  });
  const questionsMap = Object.fromEntries(questions.map((question) => [question.id, question]));

  let applications = await api.submittedApplications.findMany({
    first: 50,
    select: {
      id: true,
      data: true,
    },
  });
  do {
    await api.submittedApplications.bulkUpdate(
      applications.map(({ id, data }) => ({
        id,
        answers: convertDataToAnswers(data, questionsMap),
      })),
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (applications.hasNextPage && (applications = await applications.nextPage()));
};
