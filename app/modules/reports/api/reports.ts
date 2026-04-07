import { apiClient } from "~/lib/api-client";
import type {
  DashboardResponse,
  ReportResponse,
} from "~/modules/reports/types";

export async function getDashboard(): Promise<DashboardResponse> {
  return apiClient<DashboardResponse>("/api/reports/dashboard");
}

export async function getWeeklyReport(date?: string): Promise<ReportResponse> {
  const params = date ? `?date=${date}` : "";
  return apiClient<ReportResponse>(`/api/reports/weekly${params}`);
}

export async function getMonthlyReport(
  date?: string,
): Promise<ReportResponse> {
  const params = date ? `?date=${date}` : "";
  return apiClient<ReportResponse>(`/api/reports/monthly${params}`);
}

export async function getYearlyReport(date?: string): Promise<ReportResponse> {
  const params = date ? `?date=${date}` : "";
  return apiClient<ReportResponse>(`/api/reports/yearly${params}`);
}
