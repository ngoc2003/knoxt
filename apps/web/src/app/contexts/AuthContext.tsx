import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  GET_CURRENT_USER_QUERY,
} from "../graphql/auth";
import { User, LoginInput, RegisterInput, AuthResponse } from "@repo/shared";

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

  // Check for existing user on app load
  const { loading: userQueryLoading } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !localStorage.getItem("accessToken"),
    // onCompleted: (data) => {
    //   if (data?.me) {
    //     setUser(data.me);
    //   }
    //   setAuthLoading(false);
    // },
    // onError: (error) => {
    //   console.error("Error fetching current user:", error);
    //   // Clear invalid token
    //   localStorage.removeItem("accessToken");
    //   localStorage.removeItem("currentUser");
    //   setAuthLoading(false);
    // },
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("currentUser");

    if (token && storedUser && !userQueryLoading) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }

    if (!token) {
      setAuthLoading(false);
    }
  }, [userQueryLoading]);

  const login = async (data: LoginInput): Promise<AuthResponse> => {
    try {
      const result = await loginMutation({
        variables: { data },
      });

      //   if (result.data?.login) {
      //     const authResponse = result.data.login;
      //     localStorage.setItem("accessToken", authResponse.accessToken);
      //     localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
      //     setUser(authResponse.user);
      //     return authResponse;
      //   }
      throw new Error("Login failed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    try {
      const result = await registerMutation({
        variables: { data },
      });

      //   if (result.data?.register) {
      //     const authResponse = result.data.register;
      //     localStorage.setItem("accessToken", authResponse.accessToken);
      //     localStorage.setItem("currentUser", JSON.stringify(authResponse.user));
      //     setUser(authResponse.user);
      //     return authResponse;
      //   }
      throw new Error("Registration failed");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    loading: authLoading || userQueryLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
