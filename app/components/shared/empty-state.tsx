import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <Icon
          className="mb-4 h-12 w-12 text-muted-foreground/50"
          aria-hidden="true"
        />
      )}
      <p className="text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
