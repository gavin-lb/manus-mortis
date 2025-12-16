import { redirect, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useOutletContext } from "@remix-run/react";
import type { RootOutletContext } from "../root";
import AppFrame from "@/components/app-frame";
import backgroundUrl from "@/images/background.jpg";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { session, gadgetConfig } = context;

  if (session?.get("user")) {
    return redirect(
      gadgetConfig.authentication!.redirectOnSuccessfulSignInPath!
    );
  }

  return {};
};

export default function () {
  const context = useOutletContext<RootOutletContext>();

  return (
    <AppFrame theme={context.theme}>
      <div className="bg-no-repeat bg-cover bg-center h-full w-screen" style={{backgroundImage: `url('${backgroundUrl}')`}}>
        <div className="backdrop-blur h-full bg-gradient-to-b from-[var(--p-color-bg)] via-transparent to-[var(--p-color-bg)]">
          <Outlet context={context} />
        </div>
      </div>
    </AppFrame>
  );
}

