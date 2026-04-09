import { http, HttpResponse } from "msw";

const API_URL = "https://ledgerly-service.vercel.app";

// --- Mock Data ---

export const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
  image: null,
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const mockSession = {
  user: mockUser,
  session: {
    id: "test-session-id",
    userId: "test-user-id",
    token: "test-token",
    expiresAt: "2026-12-31T00:00:00.000Z",
  },
};

export const mockWallets = [
  {
    id: "wallet-1",
    name: "Cash",
    initialBalance: 500000,
    balance: 450000,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "wallet-2",
    name: "Bank BCA",
    initialBalance: 5000000,
    balance: 4500000,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const mockCategories = [
  {
    id: "cat-1",
    name: "Makan",
    icon: "\ud83c\udf5c",
    type: "EXPENSE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Gaji",
    icon: "\ud83d\udcb0",
    type: "INCOME",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const mockTransactions = {
  data: [
    {
      id: "txn-1",
      amount: 50000,
      type: "EXPENSE",
      method: "QRIS",
      date: "2026-04-08",
      note: "Makan siang",
      transferPairId: null,
      wallet: { id: "wallet-1", name: "Cash" },
      category: { id: "cat-1", name: "Makan", icon: "\ud83c\udf5c" },
      createdAt: "2026-04-08T12:00:00.000Z",
      updatedAt: "2026-04-08T12:00:00.000Z",
    },
    {
      id: "txn-2",
      amount: 8500000,
      type: "INCOME",
      method: null,
      date: "2026-04-01",
      note: "Gaji",
      transferPairId: null,
      wallet: { id: "wallet-2", name: "Bank BCA" },
      category: { id: "cat-2", name: "Gaji", icon: "\ud83d\udcb0" },
      createdAt: "2026-04-01T12:00:00.000Z",
      updatedAt: "2026-04-01T12:00:00.000Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const mockBudgets = [
  {
    id: "budget-1",
    name: "Budget Bulanan",
    limit: 1000000,
    spent: 450000,
    remaining: 550000,
    percentage: 45,
    status: "NORMAL",
    categories: [{ id: "cat-1", name: "Makan", icon: "\ud83c\udf5c" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const mockRecurrings = [
  {
    id: "rec-1",
    name: "Listrik",
    type: "EXPENSE",
    amount: 500000,
    dayOfMonth: 5,
    wallet: { id: "wallet-1", name: "Cash" },
    targetWallet: null,
    category: { id: "cat-1", name: "Makan", icon: "\ud83c\udf5c" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const mockDashboard = {
  totalBalance: 4950000,
  wallets: [
    { id: "wallet-1", name: "Cash", balance: 450000 },
    { id: "wallet-2", name: "Bank BCA", balance: 4500000 },
  ],
  monthlyTrend: [
    { month: "2026-01", income: 8500000, expense: 500000 },
    { month: "2026-02", income: 8500000, expense: 600000 },
  ],
};

export const mockReport = {
  period: "monthly" as const,
  startDate: "2026-04-01",
  endDate: "2026-04-30",
  totalIncome: 8500000,
  totalExpense: 500000,
  balance: 8000000,
  categoryBreakdown: [
    {
      categoryId: "cat-1",
      categoryName: "Makan",
      categoryIcon: "\ud83c\udf5c",
      total: 500000,
      count: 10,
    },
  ],
  walletBreakdown: [
    {
      walletId: "wallet-1",
      walletName: "Cash",
      totalExpense: 300000,
      totalIncome: 0,
    },
  ],
  comparison: { incomeChange: 5, expenseChange: -10 },
};

// --- Handlers ---

export const handlers = [
  // Health
  http.get(`${API_URL}/`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Auth
  http.get(`${API_URL}/api/auth/get-session`, () => {
    return HttpResponse.json(mockSession);
  }),

  http.get(`${API_URL}/api/me`, () => {
    return HttpResponse.json({ user: mockUser });
  }),

  // Wallets
  http.get(`${API_URL}/api/wallets`, () => {
    return HttpResponse.json(mockWallets);
  }),

  http.get(`${API_URL}/api/wallets/:id`, ({ params }) => {
    const wallet = mockWallets.find((w) => w.id === params.id);
    if (!wallet) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(wallet);
  }),

  http.post(`${API_URL}/api/wallets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "wallet-new", ...body, balance: body.initialBalance, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/api/wallets/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const wallet = mockWallets.find((w) => w.id === params.id);
    return HttpResponse.json({ ...wallet, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/api/wallets/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/api/wallets/seed`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Categories
  http.get(`${API_URL}/api/categories`, ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const filtered = type
      ? mockCategories.filter((c) => c.type === type)
      : mockCategories;
    return HttpResponse.json(filtered);
  }),

  http.get(`${API_URL}/api/categories/:id`, ({ params }) => {
    const cat = mockCategories.find((c) => c.id === params.id);
    if (!cat) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(cat);
  }),

  http.post(`${API_URL}/api/categories`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "cat-new", ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/api/categories/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const cat = mockCategories.find((c) => c.id === params.id);
    return HttpResponse.json({ ...cat, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/api/categories/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/api/categories/seed`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Transactions
  http.get(`${API_URL}/api/transactions`, () => {
    return HttpResponse.json(mockTransactions);
  }),

  http.get(`${API_URL}/api/transactions/:id`, ({ params }) => {
    const txn = mockTransactions.data.find((t) => t.id === params.id);
    if (!txn) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(txn);
  }),

  http.post(`${API_URL}/api/transactions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "txn-new", ...body, transferPairId: null, wallet: mockWallets[0], category: mockCategories[0], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.post(`${API_URL}/api/transactions/transfer`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json([
      { id: "txn-out", type: "TRANSFER_OUT", amount: body.amount, wallet: mockWallets[0], category: null, transferPairId: "txn-in", date: new Date().toISOString(), note: body.note, method: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "txn-in", type: "TRANSFER_IN", amount: body.amount, wallet: mockWallets[1], category: null, transferPairId: "txn-out", date: new Date().toISOString(), note: body.note, method: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);
  }),

  http.patch(`${API_URL}/api/transactions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const txn = mockTransactions.data.find((t) => t.id === params.id);
    return HttpResponse.json({ ...txn, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/api/transactions/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Budgets
  http.get(`${API_URL}/api/budgets`, () => {
    return HttpResponse.json(mockBudgets);
  }),

  http.get(`${API_URL}/api/budgets/:id`, ({ params }) => {
    const budget = mockBudgets.find((b) => b.id === params.id);
    if (!budget) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(budget);
  }),

  http.post(`${API_URL}/api/budgets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "budget-new", ...body, spent: 0, remaining: body.limit, percentage: 0, status: "NORMAL", categories: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/api/budgets/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const budget = mockBudgets.find((b) => b.id === params.id);
    return HttpResponse.json({ ...budget, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/api/budgets/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Recurrings
  http.get(`${API_URL}/api/recurrings`, () => {
    return HttpResponse.json(mockRecurrings);
  }),

  http.get(`${API_URL}/api/recurrings/due-today`, () => {
    return HttpResponse.json(mockRecurrings);
  }),

  http.get(`${API_URL}/api/recurrings/:id`, ({ params }) => {
    const rec = mockRecurrings.find((r) => r.id === params.id);
    if (!rec) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(rec);
  }),

  http.post(`${API_URL}/api/recurrings`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "rec-new", ...body, wallet: mockWallets[0], targetWallet: null, category: mockCategories[0], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/api/recurrings/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const rec = mockRecurrings.find((r) => r.id === params.id);
    return HttpResponse.json({ ...rec, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/api/recurrings/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Reports
  http.get(`${API_URL}/api/reports/dashboard`, () => {
    return HttpResponse.json(mockDashboard);
  }),

  http.get(`${API_URL}/api/reports/weekly`, () => {
    return HttpResponse.json({ ...mockReport, period: "weekly" });
  }),

  http.get(`${API_URL}/api/reports/monthly`, () => {
    return HttpResponse.json(mockReport);
  }),

  http.get(`${API_URL}/api/reports/yearly`, () => {
    return HttpResponse.json({ ...mockReport, period: "yearly" });
  }),
];
