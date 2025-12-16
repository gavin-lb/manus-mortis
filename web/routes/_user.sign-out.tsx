import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { session, gadgetConfig } = context;

  session?.set("user", null);
  return redirect(gadgetConfig.authentication!.signInPath);
};
