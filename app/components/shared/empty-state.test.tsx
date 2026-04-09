import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState message="Belum ada data" />);
    expect(screen.getByText("Belum ada data")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState message="Kosong" description="Tambahkan data baru" />);
    expect(screen.getByText("Tambahkan data baru")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState message="Kosong" />);
    expect(screen.queryByText("Tambahkan data baru")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<EmptyState icon={Inbox} message="Kosong" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState message="Kosong" action={<button>Tambah</button>} />,
    );
    expect(screen.getByText("Tambah")).toBeInTheDocument();
  });
});
