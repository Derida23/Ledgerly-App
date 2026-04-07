import { useNavigate } from "react-router";
import { ChevronLeft, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useTheme, Theme } from "~/lib/theme";
import { cn } from "~/lib/utils";

interface HeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function Header({ title, backHref, action }: HeaderProps) {
  const navigate = useNavigate();
  const { isVisible, toggle: toggleSaldo } = useSaldoVisibility();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        {backHref && (
          <button
            onClick={() => navigate(backHref)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
            aria-label="Kembali"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleSaldo}
          className={cn(
            "rounded-lg p-2 transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
        >
          {isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={() =>
            setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)
          }
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Toggle tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {action}
      </div>
    </header>
  );
}
