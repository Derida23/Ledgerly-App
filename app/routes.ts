import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),

  layout("routes/_auth.tsx", [
    route("dashboard", "routes/_auth.dashboard.tsx"),
    route("transactions", "routes/_auth.transactions.tsx"),
    route("transactions/new", "routes/_auth.transactions.new.tsx"),
    route("transactions/:id/edit", "routes/_auth.transactions.$id.edit.tsx"),
    route("transactions/new/transfer", "routes/_auth.transactions.new.transfer.tsx"),
    route("wallets", "routes/_auth.wallets.tsx"),
    route("wallets/:id", "routes/_auth.wallets.$id.tsx"),
    route("wallets/new", "routes/_auth.wallets.new.tsx"),
    route("wallets/:id/edit", "routes/_auth.wallets.$id.edit.tsx"),
    route("categories", "routes/_auth.categories.tsx"),
    route("categories/new", "routes/_auth.categories.new.tsx"),
    route("categories/:id/edit", "routes/_auth.categories.$id.edit.tsx"),
    route("budgets", "routes/_auth.budgets.tsx"),
    route("budgets/new", "routes/_auth.budgets.new.tsx"),
    route("budgets/:id/edit", "routes/_auth.budgets.$id.edit.tsx"),
    route("recurrings", "routes/_auth.recurrings.tsx"),
    route("recurrings/new", "routes/_auth.recurrings.new.tsx"),
    route("recurrings/:id/edit", "routes/_auth.recurrings.$id.edit.tsx"),
    route("reports", "routes/_auth.reports.tsx"),
    route("more", "routes/_auth.more.tsx"),
  ]),
] satisfies RouteConfig;
