import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const loader = async ({ context }) => {
  const { session } = context;

  const signedIn = !!session?.get("user");

  if (signedIn) {
    return redirect("/signed-in");
  }

  return json({});
};

export default function () {
  const context = useOutletContext();

  return (
    <>
      <Header />
      <div className="app">
        <div className="app-content">
          <div className="main">
            <Outlet context={context} />
          </div>
        </div>
      </div>
    </>
  );
}

const Header = () => {
  const { gadgetConfig } = useOutletContext();

  return (
    <div className="header">
      <a
        href="/"
        target="_self"
        rel="noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div className="logo">{gadgetConfig.env.GADGET_APP}</div>
      </a>
      <div className="header-content">
        <Link to="/sign-in" style={{ color: "black" }}>
          Sign in
        </Link>
        <Link to="/sign-up" style={{ color: "black" }}>
          Sign up
        </Link>
      </div>
    </div>
  );
};
