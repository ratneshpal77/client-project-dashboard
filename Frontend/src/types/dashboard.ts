export interface AdminDashboardData {
  totalProjects: number;
  totalTasks: number;

  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };

  overdueTasks: number;
  activeUsersOnline: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}