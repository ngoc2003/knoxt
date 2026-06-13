import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Landing } from "./Landing";

vi.mock("@/shared/components/PageTransitionProvider", () => ({
  usePageTransitionArrival: vi.fn(),
  usePageTransitionLink: () => ({
    isTransitioning: false,
    linkProps: {},
  }),
}));

describe("Landing", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
  });

  it("sends guests to registration", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole("link", { name: /start for free/i })[0],
    ).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: /skip to main content/i }),
    ).toHaveAttribute("href", "#main-content");
    expect(
      screen.getByRole("button", { name: /open navigation menu/i }),
    ).toBeInTheDocument();
  });

  it("sends authenticated users to their dashboard", () => {
    localStorage.setItem("accessToken", "test-token");

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole("link", { name: /open workspace/i })[0],
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.queryByRole("link", { name: /sign in/i }),
    ).not.toBeInTheDocument();
  });

  it("uses auth-aware links in pricing", () => {
    localStorage.setItem("accessToken", "test-token");

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: /open workspace/i })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: expect.stringContaining("/dashboard"),
        }),
      ]),
    );
    expect(screen.getByRole("link", { name: /talk to us/i })).toHaveAttribute(
      "href",
      "#contact",
    );
  });

  it("submits and resets the contact form", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Mina Chen" },
    });
    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: "mina@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I want to roll Knot.io out to my team." },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Message received. We will get back to you soon.",
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });
});
