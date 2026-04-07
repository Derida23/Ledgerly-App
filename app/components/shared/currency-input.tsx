import { useState, forwardRef } from "react";

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

function formatDisplay(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { value, onValueChange, placeholder = "Rp 0", id, className = "" },
    ref,
  ) => {
    const [display, setDisplay] = useState(() =>
      value ? formatDisplay(value) : "",
    );

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, "");
      const num = Number(raw);
      setDisplay(raw ? formatDisplay(num) : "");
      onValueChange(num);
    }

    function handleFocus() {
      if (value === 0) setDisplay("");
    }

    function handleBlur() {
      if (value > 0) setDisplay(formatDisplay(value));
    }

    return (
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
