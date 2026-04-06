# manus-mortis

A fullstack Discord app and web portal built for [gadget.dev](https://gadget.dev/) serverless architecture.

## Discord Bot

The Discord bot runs on a backend API written in TypeScript running Node on a serverless architecture with Fastify. Its features include:

- Bespoke ticketing and application system:
  - Users can open generic tickets or applications via a modal. They can edit/close their ticket or withdraw their application via a smart context menu button. The bot creates a private thread in the relevant channel, adds the appropriate users and information, and creates an associated database entry on the backend:

  |                       Ticket                       |                     Application                      |
  | :------------------------------------------------: | :--------------------------------------------------: |
  | ![ticket demo](docs/assets/discord-bot/ticket.gif) | ![alt text](docs/assets/discord-bot/application.gif) |
  - Handlers can resolve a ticket or accept/deny an application via the same smart context menu button. The bot automatically handles assigning/removing relevant roles, informing the user, and locking/closing the ticket thread:

  |                           Accept                            |                           Deny                            |
  | :---------------------------------------------------------: | :-------------------------------------------------------: |
  | ![alt text](docs/assets/discord-bot/application-accept.gif) | ![alt text](docs/assets/discord-bot/application-deny.gif) |

- Welcome message system:
  - The bot can be configured to send welcome messages to a user when they first join the server or when they gain a particular role,
  - Can be used to direct users to the message post for opening an application or for onboarding users once their application has been accepted.
  - Implemented by subscribing to the Discord Gateway API via a WebSocket connection handled with a Fastify boot plugin.
    ![alt text](docs/assets/discord-bot/welcome-message.png)

- Reward point system with leaderboards:
  - Users earn points to encourage server engagement,
  - Messages, time spent in voice channels, new member application referrals, and reaction bounties (user call-to-action system) are all tracked and award the user points,
  - Associated bot commands for point lookup and leaderboards: ![alt text](docs/assets/discord-bot/points.gif)

- User call-to-action reaction bounty system:
  - System for posting a call-to-action bounty for users to react to a post for the purpose of increasing visibility on recruitment posts,
  - Works cross-server without the need for the bot to be a member of the other server by implementing as a user app command (user adds the bot as an app on their account),

  |                         Post                         |                         Claim                         |
  | :--------------------------------------------------: | :---------------------------------------------------: |
  | ![alt text](docs/assets/discord-bot/bounty-post.gif) | ![alt text](docs/assets/discord-bot/bounty-claim.gif) |

## Web Portal

Frontend React web portal in Remix framework for full configuration of all bot features via modern interfaces built with Polaris and Shadcn components.

- Implements OAuth2 login via Discord:

  |                        Denied                         |                        Granted                         |
  | :---------------------------------------------------: | :----------------------------------------------------: |
  | ![alt text](docs/assets/web-portal/access-denied.gif) | ![alt text](docs/assets/web-portal/access-granted.gif) |

- Fully themed with a dark/light mode toggle and associated cookie ![alt text](docs/assets/web-portal/dark-mode.gif)

- Manage Users page for configuring which users have access to the web portal. Features include:
  - Search users by username fragment with realtime updated list,
  - Filter users by role or web portal access status,
  - Sort users by server join date either ascending or descending,
  - Pagination with selectable page size,
  - Multiselect and bulk actions,
    ![alt text](docs/assets/web-portal/manage-users.gif)

- Welcome Message configuration page with table populated from backend database entries, popover menu, full CRUD support via modal, form fields populated with realtime role/channel data queried from Discord API, drag and drop image uploading
  ![alt text](docs/assets/web-portal/welcome-messages.gif)

- Ticket & Applications configuration page.
  - Fields dynamically populated with data queried from Discord API, full CRUD support for application and questions, popover Emoji picker, dirty field tracking and unsaved change warning,
    ![alt text](docs/assets/web-portal/applications.gif)
  - Drag and drop question reordering,
    ![alt text](docs/assets/web-portal/question-reordering.gif)
  - Required field warnings,
    ![alt text](docs/assets/web-portal/required-field.gif)
  - Changes are immediately automatically propagated in realtime,
    ![alt text](docs/assets/web-portal/realtime-updating.gif)
  - Roles can be assigned to all successful applicants or specific roles assigned depending on their answers to multiple choice questions,
    ![alt text](docs/assets/web-portal/roles-assigned.gif)

- Points configuration page.
  - Data for relative point values is configurable,
  - Table displaying user point data populated from backend database,
  - Export via CSV download,
  - Import via modal with drag and drop upload of CSV,
    ![alt text](docs/assets/web-portal/points.gif)

- Reaction Bounties configation page.
  ![alt text](docs/assets/web-portal/bounties.gif)
