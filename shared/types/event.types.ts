import type { Status, HighlightColor } from "@prisma/client";

export interface EventBase {
  id: string;
  title: string;
  start: number;
  end?: number;
}

export type EventStatus = Status | null;

export type HighColor = HighlightColor | null;

export interface TimetableEvent extends EventBase {
  allDay: boolean;
  color: string;
  extendedProps: {
    description: string;
  };
}

export interface HomeworkEvent extends EventBase {
  extendedProps: {
    userAdded: boolean;
    status: EventStatus;
    color: HighColor;
  };
}

export interface TimetableEvents {
  [weekStart: string]: TimetableEvent[];
}

export type HomeworkStateUpdate = {
  id: string;
  status?: EventStatus | null;
  color?: HighColor | null;
};
