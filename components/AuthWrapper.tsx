import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (isLoading) return; // Don't redirect while loading

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth screens, redirect to login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // User is signed in and in auth screens, redirect to main app
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
