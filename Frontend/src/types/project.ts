export interface ProjectClient {
  id: string;
  name: string;
  company: string;
  email?: string | null;
  phone?: string | null;
}

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedDeveloperId: string | null;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE";
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  assignedDeveloper?: ProjectUser | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  createdBy: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;

  client: ProjectClient;

  creator?: ProjectUser | null;

  manager?: ProjectUser | null;

  tasks?: ProjectTask[];
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

export interface ProjectResponse {
  success: boolean;
  data: {
    project: Project;
  };
}