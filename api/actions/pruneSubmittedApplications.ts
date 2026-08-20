import { logger } from "gadget-server";

export const run: ActionRun = async ({ api }) => {
  const applicationRecords = await api.application.findMany({
    select: { id: true },
  });

  const applicationIds = new Set(applicationRecords.map(({ id }) => id));

  let records = await api.submittedApplications.findMany({
    first: 50,
    select: {
      id: true,
      applicationId: true,
    },
  });

  do {
    const toDelete = records
      .filter(({ applicationId }) => !applicationId || !applicationIds.has(applicationId))
      .map(({ id }) => id);

    if (toDelete.length > 0) {
      await api.submittedApplications.bulkDelete(toDelete);

      logger.warn(
        { toDelete, applicationIds, records },
        `Deleted ${toDelete.length} submitted applications that no longer have a corresponding application.`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (records.hasNextPage && (records = await records.nextPage()));
};
