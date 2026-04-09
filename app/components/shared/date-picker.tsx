import { useState } from "react";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-10 min-h-10! w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">
          {value
            ? format(parse(value, "yyyy-MM-dd", new Date()), "d MMM yyyy", {
                locale: id,
              })
            : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  );
}
