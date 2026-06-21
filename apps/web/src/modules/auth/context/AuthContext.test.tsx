import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const { googleMutation, loginMutation, registerMutation } = vi.hoisted(() => ({
  googleMutation: vi.fn(),
  loginMutation: vi.fn(),
  registerMutation: vi.fn(),
}));

type OperationDefinition = {
  definitions?: Array<{ name?: { value?: string } }>;
};

vi.mock("@apollo/client/react", () => ({
  useMutation: vi.fn((operation: OperationDefinition) => {
    const operationName = operation.definitions?.[0]?.name?.value;
    if (operationName === "LoginWithGoogle") return [googleMutation];
    if (operationName === "Register") return [registerMutation];
    return [loginMutation];
  }),
  useQuery: vi.fn(() => ({
    data: undefined,
    error: undefined,
    loading: false,
  })),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    googleMutation.mockReset();
    loginMutation.mockReset();
    registerMutation.mockReset();
  });

  it("stores the authenticated session after login", async () => {
    const authResponse = {
      accessToken: "test-token",
      user: {
        id: "user-1",
        email: "person@example.com",
        name: "Test Person",
        createdAt: "2026-06-09T00:00:00.000Z",
        updatedAt: "2026-06-09T00:00:00.000Z",
      },
    };
    loginMutation.mockResolvedValue({ data: { login: authResponse } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login({
        email: "person@example.com",
        password: "password",
      });
    });

    expect(result.current.user).toEqual(authResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("accessToken")).toBe("test-token");
    expect(JSON.parse(localStorage.getItem("currentUser") ?? "null")).toEqual(
      authResponse.user,
    );
  });

  it("stores the authenticated session after Google login", async () => {
    const authResponse = {
      accessToken: "google-token",
      user: {
        id: "user-2",
        email: "google@example.com",
        name: "Google Person",
        avatarUrl: "https://example.com/avatar.png",
        createdAt: "2026-06-09T00:00:00.000Z",
        updatedAt: "2026-06-09T00:00:00.000Z",
      },
    };
    googleMutation.mockResolvedValue({
      data: { loginWithGoogle: authResponse },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.loginWithGoogle({
        credential: "google-credential",
        invitationToken: "invitation-token",
      });
    });

    expect(googleMutation).toHaveBeenCalledWith({
      variables: {
        data: {
          credential: "google-credential",
          invitationToken: "invitation-token",
        },
      },
    });
    expect(result.current.user).toEqual(authResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("accessToken")).toBe("google-token");
    expect(JSON.parse(localStorage.getItem("currentUser") ?? "null")).toEqual(
      authResponse.user,
    );
  });
});
