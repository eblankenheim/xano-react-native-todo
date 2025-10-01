import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/xano";

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setAuthData: (user: User, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthData = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔑 AuthContext: Starting login process");
      const response = await authService.login(email, password);
      console.log(
        "📦 AuthContext: Received response:",
        JSON.stringify(response, null, 2)
      );

      if (response.authToken && response.user) {
        console.log("✅ Login successful, storing auth data");
        await setAuthData(response.user, response.authToken);
        return true;
      }

      console.log("❌ Invalid response structure");
      return false;
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("📝 AuthContext: Starting register process");
      const response = await authService.register(name, email, password);
      console.log(
        "📦 AuthContext: Received register response:",
        JSON.stringify(response, null, 2)
      );

      if (response.authToken && response.user) {
        console.log("✅ Registration successful, storing auth data");
        await setAuthData(response.user, response.authToken);
        return true;
      }

      console.log("❌ Invalid response structure");
      return false;
    } catch (error) {
      console.error("❌ Register error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "user"]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
