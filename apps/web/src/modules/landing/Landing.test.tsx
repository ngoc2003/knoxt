import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Landing } from "./Landing";

const useAuth = vi.fn();

vi.mock("@/modules/auth/context/AuthContext", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/shared/components/PageTransitionProvider", () => ({
  usePageTransitionLink: () => ({
    isTransitioning: false,
    linkProps: {},
  }),
}));

describe("Landing", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useAuth.mockReset();
  });

  it("sends guests to registration", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

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
  });

  it("sends authenticated users to their dashboard", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

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
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

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
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

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
      target: { value: "I want to roll Taskio out to my team." },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Message received. We will get back to you soon.",
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });
});
