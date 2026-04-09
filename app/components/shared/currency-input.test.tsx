import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyInput } from "./currency-input";

describe("CurrencyInput", () => {
  it("renders with placeholder", () => {
    render(<CurrencyInput value={0} onValueChange={() => {}} />);
    expect(screen.getByPlaceholderText("Rp 0")).toBeInTheDocument();
  });

  it("displays formatted value", () => {
    render(<CurrencyInput value={1000000} onValueChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toMatch(/1[.\u00a0]000[.\u00a0]000/);
  });

  it("strips non-numeric characters and calls onValueChange", async () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onValueChange={onChange} />);
    const input = screen.getByRole("textbox");

    await userEvent.type(input, "50000");
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(lastCall).toBe(50000);
  });

  it("shows empty string on focus when value is 0", async () => {
    render(<CurrencyInput value={0} onValueChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    await userEvent.click(input);
    expect(input.value).toBe("");
  });

  it("has numeric inputMode", () => {
    render(<CurrencyInput value={0} onValueChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputMode", "numeric");
  });
});
