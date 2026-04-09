import { useNavigate } from "react-router";
import { ChevronLeft, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useTheme, Theme } from "~/lib/theme";

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
    <header className="mx-4 mt-6 mb-4 flex h-12 items-center rounded-xl bg-muted/60 px-4 ring-1 ring-border/40 md:mt-3">
      <div className="flex flex-1 items-center gap-2">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate(backHref)}
            aria-label="Kembali"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-base font-semibold text-foreground truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSaldo}
          aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
        >
          {isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={() =>
            setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)
          }
          aria-label="Toggle tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="h-4 w-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {action}
      </div>
    </header>
  );
}
