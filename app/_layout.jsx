import { Stack } from "expo-router";
import { MusicProvider } from "../context/MusicContext";
import "../global.css";

export default function RootLayout() {
  return (
    <MusicProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </MusicProvider>
  );
}
