export interface WalletBalanceDto {
  id: string;
  name: string;
  balance: number;
}

export interface MonthlyTrendDto {
  month: string;
  income: number;
  expense: number;
}

export interface DashboardResponse {
  totalBalance: number;
  wallets: WalletBalanceDto[];
  monthlyTrend: MonthlyTrendDto[];
}

export interface CategoryBreakdownDto {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

export interface WalletBreakdownDto {
  walletId: string;
  walletName: string;
  totalExpense: number;
  totalIncome: number;
}

export interface ComparisonDto {
  incomeChange: number;
  expenseChange: number;
}

export interface ReportResponse {
  period: "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: CategoryBreakdownDto[];
  walletBreakdown: WalletBreakdownDto[];
  comparison?: ComparisonDto;
}
