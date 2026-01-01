// app/_layout.jsx
import { Stack } from "expo-router";
import React from "react";
import { MusicProvider } from "../context/MusicContext";
import { SessionProvider } from "../context/SessionContext";
import "../global.css";

console.log("📱 Root Layout Loading");

export default function RootLayout() {
  console.log("📱 Root Layout Rendering");
  
  return (
    <SessionProvider>
      <MusicProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="FaceDetection" />
        </Stack>
      </MusicProvider>
    </SessionProvider>
  );
}