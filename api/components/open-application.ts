import {
  APIMessageComponentInteractionData,
  ComponentType,
  InteractionResponseType,
} from "discord.js";
import { api } from "gadget-server";
import { JSONValue } from "../../.gadget/client/types-esm/types";

export default async ({ data }: { data: APIMessageComponentInteractionData }) => {
  let applicationId, page;
  switch (data.component_type) {
    case ComponentType.StringSelect:
      [applicationId] = data.values;
      page = 0;
      break;
    case ComponentType.Button:
      [applicationId, page] = data.custom_id.split(" ").slice(1);
      break;
    default:
      throw new Error(`Unexpected component type: ${data.component_type}`);
  }

  if (!applicationId) {
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    };
  }

  const record = await api.application.findById(applicationId);

  if (!(record.modalPages instanceof Array) || record.modalPages.length < 1) {
    throw new Error(`Application ${applicationId} has no modal pages`);
  }

  const pageNumber = Number(page);
  if (isNaN(pageNumber)) {
    throw new Error(`Page ${page} is not a number`);
  }

  return {
    type: InteractionResponseType.Modal,
    data: (record.modalPages as JSONValue[])[pageNumber],
  };
};
