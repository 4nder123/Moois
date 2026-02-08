import type { HighlightColor, Status } from "@prisma/client";
import { HomeworkEvent } from "~~/shared/types/event.types";

export type HomeworkStateUpdate = {
  userId: string;
  homeworkId: string;
  status?: Status | null;
  color?: HighlightColor | null;
  userAdded: boolean;
};

export const upsertHomeworkState = async (data: HomeworkStateUpdate) => {
  const { userId, homeworkId, status, color, userAdded } = data;
  if (userAdded) {
    await prisma.userHomework.updateMany({
      where: { id: homeworkId, userId },
      data: { status: status || null, color: color || null },
    });
    return;
  }
  await prisma.iCalHomeworkState.upsert({
    where: { userId_homeworkId: { userId, homeworkId } },
    update: { status: status || null, color: color || null },
    create: { userId, homeworkId, status: status || null, color: color || null },
  });
};


export const addHomework = async (event: HomeworkEvent, userId: string) => {
  await prisma.userHomework.create({
    data: {
      title: event.title,
      start: new Date(event.start),
      status: null,
      color: null,
      userAdded: true,
      userId,
    },
  });
};

export const removeHomework = async (homeworkId: string, userId: string) => {
  await prisma.userHomework.deleteMany({
    where: { id: homeworkId, userId },
  });
};