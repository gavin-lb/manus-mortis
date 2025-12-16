import { Form, Link, useOutletContext } from "@remix-run/react";

export default function () {
  const { gadgetConfig, user, csrfToken } = useOutletContext();

  return user ? (
    <>
      <div className="app-link">
        <img
          src="https://assets.gadget.dev/assets/default-app-assets/react-logo.svg"
          className="app-logo"
          alt="logo"
        />
        <span>You are now signed into {gadgetConfig.env.GADGET_APP}</span>
      </div>
      <div>
        <p className="description" style={{ width: "100%" }}>
          Start building your app&apos;s signed in area
        </p>
        <a
          href="/edit/files/web/routes/_auth.signed-in.jsx"
          target="_blank"
          rel="noreferrer"
          style={{ fontWeight: 500 }}
        >
          web/routes/_auth.signed-in.jsx
        </a>
      </div>
      <div className="card-stack">
        <div className="card user-card">
          <div className="card-content">
            <img
              className="icon"
              src={
                user.googleImageUrl ??
                "https://assets.gadget.dev/assets/default-app-assets/default-user-icon.svg"
              }
            />
            <div className="userData">
              <p>id: {user.id}</p>
              <p>
                name: {user.firstName} {user.lastName}
              </p>
              <p>
                email: <a href={`mailto:${user.email}`}>{user.email}</a>
              </p>
              <p>created: {user.createdAt.toString()}</p>
            </div>
          </div>
          <div className="sm-description">
            This data is fetched from the user model
          </div>
        </div>
        <div className="flex-vertical gap-4px">
          <strong>Actions:</strong>
          <Link to="/change-password">Change password</Link>
          <Form method="post" action="/sign-out">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                font: "inherit",
              }}
            >
              Sign Out
            </button>
          </Form>
        </div>
      </div>
    </>
  ) : null;
}
