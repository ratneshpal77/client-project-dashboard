export type ActivityAction =
  | "TASK_CREATED"
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED";

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
}

export interface ActivityTask {
  id: string;
  title: string;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE";
}

export interface ActivityProject {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  projectId: string;
  taskId: string | null;
  userId: string;
  action: ActivityAction;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;

  user: ActivityUser;

  task: ActivityTask | null;

  project?: ActivityProject;
}

export interface ActivityResponse {
  success: boolean;

  data: {
    activities: Activity[];
  };
}