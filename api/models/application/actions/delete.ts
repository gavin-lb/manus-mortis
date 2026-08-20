import { ActionOptions, deleteRecord } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run: ActionRun = async ({ params, record, api }) => {
  await preventCrossUserDataAccess(params, record);

  api.internal.question.deleteMany({
    filter: {
      applicationId: {
        equals: record.id,
      },
    },
  });

  api.internal.submittedApplications.deleteMany({
    filter: {
      applicationId: {
        equals: record.id,
      },
    },
  });

  await deleteRecord(record);
  await api.guild.editpost(record.guildId);
};

export const options: ActionOptions = {
  actionType: "delete",
};