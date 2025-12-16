export const run: ActionRun = async ({ api }) => {
  let records = await api.point.findMany({ first: 50, select: { id: true } });
  do {
    await api.point.bulkUpdate(records.map(({ id }) => ({ id })));
    await new Promise((resolve) => setTimeout(resolve, 10000));
  } while (records.hasNextPage && (records = await records.nextPage()));
};
