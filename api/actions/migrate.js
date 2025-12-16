/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  let users = await api.points.findMany({
    first: 250
  })
  
  do {
    api.points.bulkUpdate(users.map(
      user => ({ 
        id: user.id
      })
    ))
  } while (users = users.hasNextPage && await users.nextPage())
}
