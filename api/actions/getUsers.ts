export const run: ActionRun = async ({ api }) => {
  let users = await api.user.findMany({ first: 250 });
  const allUsers = [...users];
  while (users.hasNextPage) {
    users = await users.nextPage();
    allUsers.push(...users);
  }
  return allUsers;
};
