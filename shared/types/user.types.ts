import type { User as BetterAuthUser } from "better-auth/types";

export interface User extends BetterAuthUser {
  timetableUrl: string;
  homeworkUrl: string;
}
