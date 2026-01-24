import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 10, // Increased from 20 to make it a bit lower
          left: 20,
          right: 20,
          height: 45, // Reduced height from 70 to 65
          borderRadius: 25, // Reduced from 35 to 25
          backgroundColor: "rgba(18, 18, 24, 0.95)",
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 15, // Slightly reduced
          shadowOffset: { width: 0, height: 8 }, // Reduced shadow offset
          borderWidth: 1, // Added subtle border
          borderColor: "rgba(124, 77, 255, 0.25)", // Using home page purple
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={26}
              color={focused ? "#7C4DFF" : "#888"} // Updated to match home page purple
            />
          ),
        }}
      />

      {/* Center Music Button */}
      <Tabs.Screen
        name="music"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 58, // Slightly smaller
                height: 58, // Slightly smaller
                borderRadius: 29, // Adjusted to match new size
                backgroundColor: "#7C4DFF", // Updated to match home page
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 28, // Adjusted to match new height
                shadowColor: "#7C4DFF", // Updated color
                shadowOpacity: 0.5, // Slightly reduced
                shadowRadius: 12, // Reduced
                shadowOffset: { width: 0, height: 8 }, // Reduced
                elevation: 8, // Reduced
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Ionicons name="musical-notes" size={26} color="#fff" />
            </View>
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={26}
              color={focused ? "#7C4DFF" : "#888"} // Updated to match home page purple
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
