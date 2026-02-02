import axios from "axios";
import icsHomeworkConverter from "~~/server/services/icsHomeworkConverter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allowedHosts = ["moodle"];

const getHomeworkUrl = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!user.homeworkUrl) return "";
  return user.homeworkUrl;
};

export const getEvents = async (userId: string) => {
  try {
    const urlString = await getHomeworkUrl(userId);
    if (!urlString) return [];
    const url = new URL(urlString);
    if (!allowedHosts.some((host) => url.hostname.includes(host)))
      throw createError({ statusCode: 400, message: "Invalid URL host" });

    const { data } = await axios.get(url.toString());
    return await icsHomeworkConverter(data.toString());
  } catch (event) {
    console.log(event);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process homework",
    });
  }
};
