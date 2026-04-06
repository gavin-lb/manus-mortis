import { ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ session }) => {
  // Removes the user from the active session
  session?.set("user", null);
};

export const options: ActionOptions = {
  actionType: "update",
};
