import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://manus-mortis.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      models: {
        session: {
          actions: {
            signIn: true,
          },
        },
      },
      actions: {
        getChannels: true,
        getMembers: true,
        getRoles: true,
        getUsers: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        session: {
          actions: {
            signIn: true,
          },
        },
      },
    },
    manager: {
      storageKey: "5cW8--Iakkct",
      models: {
        session: {
          actions: {
            signIn: true,
          },
        },
      },
    },
  },
};
