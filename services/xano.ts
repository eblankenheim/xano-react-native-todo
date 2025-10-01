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
      const response = await authAPI.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.post("/auth/signup", {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Register API error:", error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await authAPI.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get profile API error:", error);
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
