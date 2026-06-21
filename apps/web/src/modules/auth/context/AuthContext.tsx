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
  LOGIN_WITH_GOOGLE_MUTATION,
  REGISTER_MUTATION,
  GET_CURRENT_USER_QUERY,
} from "../graphql/auth";
import {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
  GoogleLoginInput,
} from "@repo/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  loginWithGoogle: (data: GoogleLoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface CurrentUserData {
  me: User;
}

interface LoginData {
  login: AuthResponse;
}

interface LoginWithGoogleData {
  loginWithGoogle: AuthResponse;
}

interface RegisterData {
  register: AuthResponse;
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

  const [loginMutation] = useMutation<LoginData>(LOGIN_MUTATION);
  const [loginWithGoogleMutation] = useMutation<LoginWithGoogleData>(
    LOGIN_WITH_GOOGLE_MUTATION,
  );
  const [registerMutation] = useMutation<RegisterData>(REGISTER_MUTATION);

  // Modern Apollo useQuery: Handle results in useEffect or via 'data'
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery<CurrentUserData>(GET_CURRENT_USER_QUERY, {
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
      return storeAuthResponse(result.data.login);
    }
    throw new Error("Login failed");
  };

  const loginWithGoogle = async (
    data: GoogleLoginInput,
  ): Promise<AuthResponse> => {
    const result = await loginWithGoogleMutation({ variables: { data } });
    if (result.data?.loginWithGoogle) {
      return storeAuthResponse(result.data.loginWithGoogle);
    }
    throw new Error("Google login failed");
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    const result = await registerMutation({ variables: { data } });
    if (result.data?.register) {
      return storeAuthResponse(result.data.register);
    }
    throw new Error("Registration failed");
  };

  const storeAuthResponse = (authResponse: AuthResponse) => {
    localStorage.setItem("accessToken", authResponse.accessToken);
    localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
    return authResponse;
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
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
