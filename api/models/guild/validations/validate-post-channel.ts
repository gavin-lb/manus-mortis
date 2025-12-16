import type { GuildPostChannelFieldValidationContext } from "gadget-server";

/**
 * Validation code for field post on guild
 */
export default async ({
  api,
  record,
  errors,
  logger,
  field,
}: GuildPostChannelFieldValidationContext) => {
  if (!!record.postChannel) {
    if (record.postChannel instanceof Object) {
      if (!("name" in record.postChannel)) {
        errors.add("postChannel", "missing name");
      } else if (typeof record.postChannel.name !== "string") {
        errors.add("postChannel", "name is not string");
      }

      if (!("id" in record.postChannel)) {
        errors.add("postChannel", "missing id");
      } else if (typeof record.postChannel.id !== "string") {
        errors.add("postChannel", "id is not string");
      }
    } else {
      errors.add("postChannel", "postChannel is not object");
    }
  }
};
