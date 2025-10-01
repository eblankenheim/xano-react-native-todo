import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todo App</Text>
        <Text style={styles.welcome}>Welcome, {user?.name || "User"}!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Your todos will appear here</Text>
        <Text style={styles.message}>
          Authentication system is now working! This is a placeholder for the
          todo list functionality.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    padding: 24,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
