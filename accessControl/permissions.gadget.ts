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
      default: {
        read: true,
        action: true,
      },
      models: {
        "application/answer": {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        "application/form": {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        "application/question": {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        "application/thread": {
          read: true,
          actions: {
            accept: true,
            create: true,
            delete: true,
            deny: true,
            reminder: true,
            timeout: true,
            update: true,
            withdraw: true,
          },
        },
        assign_poll_role: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        "bounty/claimed": {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        "bounty/posted": {
          read: true,
          actions: {
            create: true,
            delete: true,
            expire: true,
            update: true,
          },
        },
        create_poll: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        guild: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        points: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        ticket: {
          read: true,
          actions: {
            close: true,
            create: true,
            delete: true,
            update: true,
          },
        },
        user: {
          read: {
            filter: "accessControl/filters/user/tenant.gelly",
          },
          actions: {
            changePassword: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
          },
        },
      },
      actions: {
        deployCommands: true,
        discordRequest: true,
        keepAlive: true,
        migrate: true,
        roleOptOut: true,
        sendReminder: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        user: {
          actions: {
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signUp: true,
            verifyEmail: true,
          },
        },
      },
    },
  },
};
