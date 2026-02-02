interface EventBase {
  id: string;
  title: string;
  start: number;
  end: number;
}

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
    status: "high" | "done" | "";
    color: string;
  };
}

export interface TimetableEvents {
  [weekStart: string]: TimetableEvent[];
}
