import type { H3Event } from 'h3'
import icsHomeworkConverter from "~~/server/services/icsHomeworkConverter";
import icsTimetableConverter from "~~/server/services/icsTimetableConverter";

export const getHomeworkJson = defineCachedFunction(async (event: H3Event, url: string) => {
  const response = await $fetch(url.toString())
  return await icsHomeworkConverter(response as string)
}, {
  maxAge: 60 * 30,
  name: 'icsHomework',
  getKey: (event: H3Event, url: string) => url
})

export const getTimetableJson = defineCachedFunction(async (event: H3Event, url: string) => {
  const response = await $fetch(url.toString())
  return await icsTimetableConverter(response as string)
}, {
  maxAge: 60 * 30,
  name: 'icsTimetable',
  getKey: (event: H3Event, url: string) => url
})