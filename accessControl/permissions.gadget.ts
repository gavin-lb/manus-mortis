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
        guild: {
          read: true,
          actions: {
            update: true,
          },
        },
        user: {
          read: true,
          actions: {
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            update: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
          },
        },
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        user: {
          read: {
            filter: "accessControl/filters/user/tenant2.gelly",
          },
          actions: {
            update: {
              filter: "accessControl/filters/user/tenant2.gelly",
            },
          },
        },
      },
    },
    manager: {
      storageKey: "5cW8--Iakkct",
      models: {
        user: {
          read: true,
          actions: {
            delete: true,
            update: true,
          },
        },
      },
    },
  },
};
