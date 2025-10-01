import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// API Base URLs
const AUTH_API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:0EHxHUr7";
const TODOS_API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:kZemCDCA";

// Create axios instances
const authAPI = axios.create({
  baseURL: AUTH_API_BASE,
});

const todosAPI = axios.create({
  baseURL: TODOS_API_BASE,
});

// Request interceptor to add auth token
const addAuthInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    async (config: any) => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

// Add auth interceptors to both API instances
addAuthInterceptor(authAPI);
addAuthInterceptor(todosAPI);

// Response interceptor to handle unauthorized responses
const addResponseInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        // Token is invalid, clear it
        await AsyncStorage.multiRemove(["authToken", "user"]);
        // You might want to trigger a logout here
      }
      return Promise.reject(error);
    }
  );
};

addResponseInterceptor(authAPI);
addResponseInterceptor(todosAPI);

// Auth API functions
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login with:", {
        email,
        endpoint: "/auth/login",
      });

      // Step 1: Login to get authToken
      const loginResponse = await authAPI.post("/auth/login", {
        email,
        password,
      });
      console.log(
        "✅ Login response:",
        JSON.stringify(loginResponse.data, null, 2)
      );

      const authToken = loginResponse.data.authToken;
      if (!authToken) {
        throw new Error("No authToken received from login");
      }

      // Step 2: Get user data using the token
      console.log("👤 Fetching user data with token...");
      const userResponse = await authAPI.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log(
        "✅ User data response:",
        JSON.stringify(userResponse.data, null, 2)
      );

      // Return combined response
      return {
        authToken,
        user: {
          id: userResponse.data.id,
          email: userResponse.data.email,
          name: userResponse.data.name || userResponse.data.email, // Fallback if no name
        },
      };
    } catch (error: any) {
      console.error("❌ Login API error:", error);
      console.error("📄 Error response:", error.response?.data);
      console.error("🔢 Error status:", error.response?.status);
      console.error("📬 Error message:", error.message);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      console.log("📝 Attempting register with:", {
        name,
        email,
        endpoint: "/auth/signup",
      });

      // Step 1: Register to get authToken
      const registerResponse = await authAPI.post("/auth/signup", {
        name,
        email,
        password,
      });
      console.log(
        "✅ Register response:",
        JSON.stringify(registerResponse.data, null, 2)
      );

      const authToken = registerResponse.data.authToken;
      if (!authToken) {
        throw new Error("No authToken received from register");
      }

      // Step 2: Get user data using the token
      console.log("👤 Fetching user data after registration...");
      const userResponse = await authAPI.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log(
        "✅ User data response:",
        JSON.stringify(userResponse.data, null, 2)
      );

      // Return combined response
      return {
        authToken,
        user: {
          id: userResponse.data.id,
          email: userResponse.data.email,
          name: userResponse.data.name || name || userResponse.data.email, // Use provided name or fallback
        },
      };
    } catch (error: any) {
      console.error("❌ Register API error:", error);
      console.error("📄 Error response:", error.response?.data);
      console.error("🔢 Error status:", error.response?.status);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      console.log("👤 Fetching user profile...");
      const response = await authAPI.get("/auth/me");
      console.log(
        "✅ Profile response:",
        JSON.stringify(response.data, null, 2)
      );
      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name || response.data.email, // Fallback if no name
      };
    } catch (error: any) {
      console.error("❌ Get profile API error:", error);
      console.error("📄 Error response:", error.response?.data);
      console.error("🔢 Error status:", error.response?.status);
      throw error;
    }
  },
};

// Todos API functions
export const todosService = {
  getTodos: async () => {
    try {
      const response = await todosAPI.get("/todo");
      return response.data;
    } catch (error) {
      console.error("Get todos API error:", error);
      throw error;
    }
  },

  createTodo: async (title: string, description?: string) => {
    try {
      const response = await todosAPI.post("/todo", {
        title,
        description,
      });
      return response.data;
    } catch (error) {
      console.error("Create todo API error:", error);
      throw error;
    }
  },

  updateTodo: async (
    id: number,
    updates: { title?: string; description?: string; completed?: boolean }
  ) => {
    try {
      const response = await todosAPI.patch(`/todo/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Update todo API error:", error);
      throw error;
    }
  },

  deleteTodo: async (id: number) => {
    try {
      const response = await todosAPI.delete(`/todo/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete todo API error:", error);
      throw error;
    }
  },
};

// Utility function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};
