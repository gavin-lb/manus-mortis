import {
  JSONValue
} from "@gadget-client/manus-mortis";
import { logger } from "gadget-server";
import { escapeCsvField } from "../utils";

function convertDataToAnswers(
  data: JSONValue,
  questionsMap: Record<string, {
    id: string;
    title: string;
  }>
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

  return data.components.map((component, index) => {
    if (
      typeof component !== "object" ||
      component === null ||
      !("component" in component) ||
      typeof component.component !== "object" ||
      component.component === null ||
      (!("value" in component.component) && !("values" in component.component && Array.isArray(component.component.values))) ||
      !("custom_id" in component.component) ||
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

    return escapeCsvField(
      `Q${index + 1}. ${question.title}: ${component.component.value ?? (component.component.values as Array<string>).join(", ") ?? "No response given"}`
    );
  }).join(", ");
}

export const run: ActionRun = async ({
  api
}) => {
  const questions = await api.question.findMany({
    select: {
      id: true,
      title: true
    }
  });
  const questionsMap = Object.fromEntries(questions.map((question) => [question.id, question]));

  let applications = await api.submittedApplications.findMany({
    first: 50,
    select: {
      id: true,
      data: true
    }
  });
  do {
    await api.submittedApplications.bulkUpdate(applications.map(({
      id,
      data
    }) => ({
      id,
      answers: convertDataToAnswers(data, questionsMap)
    })));

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (applications.hasNextPage && (applications = await applications.nextPage()));
};