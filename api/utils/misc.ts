/**
 * Formats an integer number of seconds into a `days hours:minutes:seconds` string.
 * @param  {Int}    seconds   The number of seconds.
 * @return {String}           The formatted string.
 */
export function formatSeconds(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return (
    (days ? `${days}d ` : "") +
    (hours ? `${String(hours).padStart(2, "0")}h:` : "") +
    `${String(minutes).padStart(2, "0")}m:${String(seconds % 60).padStart(2, "0")}s`
  );
}

/**
 * Formats a `space separated` or `snake_case`/`camelCase` string into a `Title Case` or `TitleCase` string, respectively.
 * @param  {String}    str    The input string.
 * @return {String}           The `Title Case`/`TitleCase` string.
 */
export function toTitleCase(str: string): string {
  const [delim, sep] = str.includes(" ") ? [" ", " "] : ["_", ""];
  return str
    .toLowerCase()
    .split(delim)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(sep);
}

/**
 * Formats a `space separated`, or `camelCase` string into a `snake_case` string.
 * @param  {String}    str    The input string.
 * @return {String}           The `snake_case` string.
 */
export function toSnakeCase(str: string): string {
  return (
    str.includes(" ") ? str.replace(" ", "_") : str.replace(/(?<=.)[A-Z]/g, (char) => `_${char}`)
  ).toLowerCase();
}

/**
 * Formats a `space separated`, `camelCase` or `snake_case` string into a `kebab-case` string.
 * @param  {String}    str    The input string.
 * @return {String}           The `kebab-case` string.
 */
export function toKebabCase(str: string): string {
  return toSnakeCase(str).replaceAll("_", "-");
}

/**
 * Splits an array into chunks of size n.
 * @param  {Array}  arr   The input array.
 * @param  {Int}    n     The size of each chunk.
 * @return {Array}        An array of chunks, each of length n (except possibly the last).
 */
export function chunks(arr: any[], n: number): Array<any> {
  const res = [];

  for (let i = 0; i < arr.length; i += n) {
    res.push(arr.slice(i, i + n));
  }

  return res;
}

/**
 * Formats an integer into the ordinal string, eg. 1 -> 1st, 2 -> 2nd, etc.
 * @param  {Int}    number    The input integer.
 * @return {String}           The ordinal string.
 */
export function toOrdinal(number: number): string {
  const str = String(number);
  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) {
    return `${str}th`;
  }
  if (str.endsWith("1")) {
    return `${str}st`;
  }
  if (str.endsWith("2")) {
    return `${str}nd`;
  }
  if (str.endsWith("3")) {
    return `${str}rd`;
  }
  return `${str}th`;
}
