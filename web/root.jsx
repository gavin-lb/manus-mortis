import { Provider as GadgetProvider } from "@gadgetinc/react";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import appStylesHref from "./app.css?url";
import { api } from "./api";

export const links = () => [
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: "https://assets.gadget.dev/assets/reset.min.css" },
];

export const meta = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "Gadget Remix app" },
];

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const loader = async ({ context }) => {
  const { session, gadgetConfig } = context;

  return json({
    gadgetConfig,
    csrfToken: session?.get("csrfToken"),
  });
};

export default function App() {
  const { gadgetConfig, csrfToken } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Suspense>
          <GadgetProvider api={api}>
            <Outlet context={{ gadgetConfig, csrfToken }} />
          </GadgetProvider>
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
