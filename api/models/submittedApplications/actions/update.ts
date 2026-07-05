import { JSONValue } from "@gadget-client/manus-mortis";
import { APIModalSubmission } from "discord-api-types/payloads/v10";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run: ActionRun = async ({ params, record }) => {
  if (!params.submittedApplications) {
    return;
  }

  if (params.submittedApplications.data) {
    params.submittedApplications.data = mergeData(
      record.data as unknown as APIModalSubmission,
      params.submittedApplications.data as unknown as APIModalSubmission,
    );
  }

  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  await save(record);
};

export const options: ActionOptions = {
  actionType: "update",
};

function mergeData(oldData: APIModalSubmission, newData: APIModalSubmission): JSONValue {
  return {
    components: [...oldData.components, ...newData.components],
    resolved: {
      users: { ...oldData.resolved?.users, ...newData.resolved?.users },
      roles: { ...oldData.resolved?.roles, ...newData.resolved?.roles },
      members: { ...oldData.resolved?.members, ...newData.resolved?.members },
      channels: { ...oldData.resolved?.channels, ...newData.resolved?.channels },
      attachments: { ...oldData.resolved?.attachments, ...newData.resolved?.attachments },
    },
  } as unknown as JSONValue;
}
