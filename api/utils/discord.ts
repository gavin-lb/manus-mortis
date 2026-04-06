import {
  APIUser,
  Interaction,
  RESTDeleteAPIChannelMessageResult,
  RESTDeleteAPIGuildMemberRoleResult,
  RESTDeleteAPIWebhookWithTokenMessageResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildResult,
  RESTPatchAPIChannelJSONBody,
  RESTPatchAPIChannelMessageJSONBody,
  RESTPatchAPIChannelMessageResult,
  RESTPatchAPIChannelResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
  RESTPostAPIChannelThreadsJSONBody,
  RESTPostAPIChannelThreadsResult,
  RESTPutAPIGuildMemberRoleResult,
  TimestampStyles,
  TimestampStylesString,
} from "discord.js";
import { logger } from "gadget-server";

export interface TimestampOptions {
  format: TimestampStylesString;
  timezone: number;
  hour: number;
  minute?: number;
  seconds?: number;
  day?: number;
  month?: string;
  year?: number;
}

const API_URL = "https://discord.com/api/v10/";

/**
 * Makes a request to the Discord API.
 *
 * @param {String} endpoint - The API endpoint to which the request is sent.
 * @param {Object} options - An object containing options for the request.
 * @property {string} options.method - The method of the request, eg. 'GET', 'POST', etc.
 * @property {Object} [options.body] - Where applicable, the body of the request as a JSON encodable object (optional).
 * @return {Object | null} - An object corresponding to the JSON response to the request.
 */
export async function discordRequest(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    body?: Record<string, any>;
  },
): Promise<Record<string, any> | Record<string, any>[] | null> {
  const res = await fetch(API_URL + endpoint, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": "Manus Mortis Bot",
    },
    method: options.method,
    body: JSON.stringify(options.body),
  });

  if (res.status == 429) {
    logger.warn({ res }, "Rate limited");
    throw new Error("Rate limited");
  }

  try {
    const data = await res.json();
    logger.debug({ endpoint, options, response: data }, "Discord request");
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data;
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      logger.error({ endpoint, options, res, err }, "discordRequest error");
    }
    return {};
  }
}

export async function sendMessage(channelId: string, body: RESTPostAPIChannelMessageJSONBody) {
  return (await discordRequest(`/channels/${channelId}/messages`, {
    method: "POST",
    body,
  })) as RESTPostAPIChannelMessageResult;
}

export async function editMessage(
  channelId: string,
  messageId: string,
  body: RESTPatchAPIChannelMessageJSONBody,
) {
  return (await discordRequest(`/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    body,
  })) as RESTPatchAPIChannelMessageResult;
}

export async function deleteMessage(channelId: string, messageId: string) {
  return (await discordRequest(`/channels/${channelId}/messages/${messageId}`, {
    method: "DELETE",
  })) as RESTDeleteAPIChannelMessageResult;
}

export async function createThread(channelId: string, body: RESTPostAPIChannelThreadsJSONBody) {
  return (await discordRequest(`/channels/${channelId}/threads`, {
    method: "POST",
    body,
  })) as RESTPostAPIChannelThreadsResult;
}

export async function editChannel(channelId: string, body: RESTPatchAPIChannelJSONBody) {
  return (await discordRequest(`/channels/${channelId}`, {
    method: "PATCH",
    body,
  })) as RESTPatchAPIChannelResult;
}

export async function addRole(guildId: string, userId: string, roleId: string) {
  return (await discordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
  })) as RESTPutAPIGuildMemberRoleResult;
}

export async function removeRole(guildId: string, userId: string, roleId: string) {
  return (await discordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "DELETE",
  })) as RESTDeleteAPIGuildMemberRoleResult;
}

export function getAvatarURL(user: APIUser) {
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

export async function deleteParentMessage(interactionToken: Interaction["token"]) {
  return (await discordRequest(
    `/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`,
    {
      method: "DELETE",
    },
  )) as RESTDeleteAPIWebhookWithTokenMessageResult;
}

export async function getGuild(guildId: string) {
  return (await discordRequest(`/guilds/${guildId}`, {
    method: "GET",
  })) as RESTGetAPIGuildResult;
}

export async function getGuildMember(guildId: string, userId: string) {
  return (await discordRequest(`/guilds/${guildId}/members/${userId}`, {
    method: "GET",
  })) as RESTGetAPIGuildMemberResult;
}

export function isTimestampOptions(options: unknown): options is TimestampOptions {
  if (typeof options !== "object" || options === null) return false;

  const obj = options as Record<string, unknown>;

  return (
    typeof obj.format === "string" &&
    Object.values(TimestampStyles).includes(obj.format as TimestampStylesString) &&
    !isNaN(Number(obj.timezone)) &&
    !isNaN(Number(obj.hour))
  );
}

export function buildTimestamp(options: TimestampOptions) {
  const currentDate = new Date(Date.now() + options.timezone * 3600000);
  const [currentDay, currentMonth, currentYear] = currentDate
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .split(" ");
  const day = options.day ?? currentDay;
  const month = options.month ?? currentMonth;
  const year = options.year ?? currentYear;
  const minute = String(options.minute ?? 0).padStart(2, "0");
  const seconds = String(options.seconds ?? 0).padStart(2, "0");
  const dateString = `${day} ${month} ${year} ${options.hour}:${minute}:${seconds} UTC${options.timezone}`;
  const date = Date.parse(dateString);

  if (isNaN(date)) {
    logger.error({ dateString }, "Date error");
    throw new Error("Date error");
  }

  const timestamp = `<t:${Math.floor(date / 1000)}:${options.format}>`;

  return `📆**Timestamp:**  \`${timestamp}\`\n🔍**Preview:**  ${timestamp}`;
}
