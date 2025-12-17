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
        application: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        bounty: {
          read: true,
        },
        claimedBounty: {
          read: true,
        },
        guild: {
          read: true,
          actions: {
            update: true,
          },
        },
        point: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        question: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sentWelcomeMessage: {
          read: true,
        },
        session: {
          actions: {
            signIn: true,
          },
        },
        submittedApplications: {
          read: true,
        },
        tickets: {
          read: true,
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
        welcomeMessage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
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
        session: {
          actions: {
            signIn: true,
          },
        },
        user: {
          read: true,
          actions: {
            create: true,
            delete: true,
            demote: true,
            promote: true,
            update: true,
          },
        },
      },
    },
  },
};
