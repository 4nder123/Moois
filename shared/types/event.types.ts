interface EventBase {
  id: string;
  title: string;
  start: number;
  end: number;
}

export type EventStatus = "highlighted" | "done" | "";

export type HighColor = "red" | "orange" | "yellow";

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
    color: HighColor | "";
  };
}

export interface TimetableEvents {
  [weekStart: string]: TimetableEvent[];
}
