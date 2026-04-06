import { Provider as GadgetProvider } from "@gadgetinc/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import type { ThemeName } from "@shopify/polaris-tokens";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { LinkLikeComponentProps } from "@shopify/polaris/build/ts/src/utilities/link";
import translations from "@shopify/polaris/locales/en.json";
import { parse } from "cookie";
import type { GadgetConfig } from "gadget-server";
import { Suspense, useState } from "react";
import { api } from "./api";
import styles from "./app.css?url";

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: "https://assets.gadget.dev/assets/reset.min.css" },
];

export const meta = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1.3" },
  { title: "Manus Mortis Web Portal" },
];

function LinkWrapper(props: LinkLikeComponentProps) {
  return (
    <Link to={props.url ?? props.to} ref={props.ref} {...props}>
      {props.children}
    </Link>
  );
}

export type RootOutletContext = {
  gadgetConfig: GadgetConfig;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { gadgetConfig } = context;
  const cookie = parse(request.headers.get("Cookie") ?? "");
  const savedTheme = cookie.theme as ThemeName | undefined;

  return { gadgetConfig, savedTheme };
};

export default function App() {
  const { gadgetConfig, savedTheme } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useState<ThemeName>(savedTheme ?? "dark-experimental");

  const context: RootOutletContext = { gadgetConfig, theme, setTheme };

  return (
    <html
      lang="en"
      className={`p-theme-${theme} ${theme === "dark-experimental" ? "dark" : "light"}`}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={translations} theme={theme} linkComponent={LinkWrapper}>
          <Suspense>
            <GadgetProvider api={api}>
              <Outlet context={context} />
            </GadgetProvider>
          </Suspense>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
