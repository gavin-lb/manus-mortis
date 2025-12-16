import { useOutletContext } from "@remix-run/react";

export default function () {
  const { gadgetConfig } = useOutletContext();

  return (
    <>
      <div className="app-link">
        <img
          src="https://assets.gadget.dev/assets/default-app-assets/react-logo.svg"
          className="app-logo"
          alt="logo"
        />
        <span>You are now signed out of {gadgetConfig.env.GADGET_APP} &nbsp;</span>
      </div>
      <div>
        <p className="description">
          Start building your app&apos;s signed out area
        </p>
        <a
          href="/edit/files/web/routes/_root._index.jsx"
          target="_blank"
          rel="noreferrer"
          style={{ fontWeight: 500 }}
        >
          web/routes/_root._index.jsx
        </a>
      </div>
    </>
  );
}
