import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "@apollo/client/react"; // Cleaned up import

import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  GET_CURRENT_USER_QUERY,
} from "../graphql/auth";
import { User, LoginInput, RegisterInput, AuthResponse } from "@repo/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Modern Apollo useQuery: Handle results in useEffect or via 'data'
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: typeof window !== "undefined" && !localStorage.getItem("accessToken"),
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
      localStorage.setItem("currentUser", JSON.stringify(data.me));
    }

    if (error) {
      console.error("Auth error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      setUser(null);
    }

    // Set loading to false once the query finishes (or if skipped)
    if (!queryLoading) {
      setAuthLoading(false);
    }
  }, [data, error, queryLoading]);

  const login = async (data: LoginInput): Promise<AuthResponse> => {
    const result = await loginMutation({ variables: { data } });
    if (result.data?.login) {
      const authResponse = result.data.login;
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
      setUser(authResponse.user);
      return authResponse;
    }
    throw new Error("Login failed");
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    const result = await registerMutation({ variables: { data } });
    if (result.data?.register) {
      const authResponse = result.data.register;
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
      setUser(authResponse.user);
      return authResponse;
    }
    throw new Error("Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    loading: authLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
