import type { HomeworkEvent } from "~~/shared/types/event.types";

export const upsertHomeworkState = async (
  data: HomeworkStateUpdate,
  userId: string,
) => {
  const { id, status, color } = data;
  await prisma.homeworkState.upsert({
    where: { userId_homeworkId: { userId, homeworkId: id } },
    update: { status: status ?? null, color: color ?? null },
    create: {
      userId,
      homeworkId: id,
      status: status ?? null,
      color: color ?? null,
    },
  });
};

export const addHomework = async (event: HomeworkEvent, userId: string) => {
  return await prisma.userHomework.create({
    data: {
      title: event.title,
      start: new Date(event.start),
      userId,
    },
  });
};

export const removeHomework = async (homeworkId: string, userId: string) => {
  await prisma.userHomework.delete({
    where: { id: homeworkId, userId },
  });
};

export const getHomeworkStates = async (userId: string) => {
  return await prisma.homeworkState.findMany({
    where: {
      userId,
    },
    select: {
      homeworkId: true,
      status: true,
      color: true,
    },
  });
};

export const getUserHomeworks = async (userId: string) => {
  return await prisma.userHomework.findMany({
    where: { userId },
  });
};
