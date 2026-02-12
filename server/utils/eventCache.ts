import crypto from "crypto";
import type { H3Event } from "h3";

function md5(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

type EventConverter<T> = (response: string) => T | Promise<T>;

export const getEventJson = defineCachedFunction(
  async <T>(converter: EventConverter<T>, event: H3Event, url: string) => {
    const response = await $fetch(url);
    return converter(response as string);
  },
  {
    maxAge: 60 * 5,
    name: "icsHomework",
    getKey: <T>(converter: EventConverter<T>, event: H3Event, url: string) =>
      md5(url),
  },
);
