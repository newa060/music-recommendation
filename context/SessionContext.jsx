// context/SessionContext.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  console.log("🔵 SessionProvider is rendering");
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    checkSession();
  }, []);

  // ✅ UPDATED: More aggressive navigation protection
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isIndexRoute = pathname === "/" || pathname === "/index";

    console.log("📍 Navigation Check:", { 
      isAuthenticated: !!user, 
      pathname, 
      inAuthGroup,
      inTabsGroup 
    });

    if (!user) {
      // User is NOT logged in
      if (inTabsGroup) {
        // Trying to access protected tabs without login
        console.log("🔴 Not authenticated, redirecting to signin");
        router.replace("/signin");
      }
      // Allow access to auth routes (signin/signup) and index
    } else {
      // User IS logged in
      if (inAuthGroup || isIndexRoute) {
        // Trying to access auth screens while logged in
        console.log("🟢 Already authenticated, redirecting to home");
        router.replace("/home");
      }
      // Allow access to tabs when logged in
    }
  }, [user, segments, isLoading, pathname]);

  const checkSession = async () => {
    try {
      console.log("🔍 Checking session...");
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("✅ Session found:", parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log("❌ No session found");
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData) => {
    try {
      console.log("🔑 Signing in user:", userData.email);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("❌ Error saving session:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out user");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userId");
      setUser(null);
      router.replace("/signin");
    } catch (error) {
      console.error("❌ Error signing out:", error);
      throw error;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    updateUser,
    isAuthenticated: !!user,
  };

  console.log("🔵 SessionProvider value:", { isAuthenticated: !!user, email: user?.email });

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  console.log("🔍 useSession called");
  const context = useContext(SessionContext);
  
  if (!context) {
    console.error("❌ useSession: SessionContext is null!");
    throw new Error("useSession must be used within SessionProvider");
  }
  
  console.log("✅ useSession: context found");
  return context;
};