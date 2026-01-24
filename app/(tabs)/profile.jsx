import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMusic } from "../../context/MusicContext";
import { useSession } from "../../context/SessionContext";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { stopMusic } = useMusic();
  const { signOut, user: sessionUser } = useSession();

  // Load user info
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try to get from session context
        if (sessionUser) {
          setName(sessionUser.name || "User");
          setEmail(sessionUser.email || "");
          if (sessionUser.id) {
            setUserId(sessionUser.id);
          }
          return;
        }

        // Fallback to AsyncStorage
        const storedUserId =
          (await AsyncStorage.getItem("userId")) ||
          (await AsyncStorage.getItem("userID")) ||
          (await AsyncStorage.getItem("id")) ||
          (await AsyncStorage.getItem("user_id"));

        if (storedUserId) {
          setUserId(storedUserId);
        }

        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setName(userData.name || "User");
          setEmail(userData.email || "");
          if (userData.id) {
            setUserId(userData.id);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [sessionUser]);

  // Get initials from email
  const getInitialsFromEmail = (email) => {
    if (!email || email.trim() === "") return "U";

    // Get first letter of email (before @ symbol)
    const username = email.split("@")[0];

    // Remove numbers and special characters, get first letter
    const firstLetter = username.replace(/[^a-zA-Z]/g, "").charAt(0);

    // If no letter found, use 'U'
    return firstLetter ? firstLetter.toUpperCase() : "U";
  };

  // Get random color for avatar based on email
  const getAvatarColor = (email) => {
    if (!email) return ["#7C4DFF", "#8A84FF"];

    // Color options
    const colorSets = [
      ["#7C4DFF", "#8A84FF"], // Purple
      ["#FF4081", "#FF6B6B"], // Pink
      ["#4CAF50", "#66BB6A"], // Green
      ["#2196F3", "#42A5F5"], // Blue
      ["#FF9800", "#FFB74D"], // Orange
      ["#9C27B0", "#BA68C8"], // Deep Purple
    ];

    // Generate consistent color based on email
    const hash = email.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const index = Math.abs(hash) % colorSets.length;
    return colorSets[index];
  };

  // Logout function - FIXED
  const handleLogout = async () => {
    try {
      await stopMusic(); // Stop music first
      await signOut(); // Sign out from session context

      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Navigate to login/signup screen
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0A0A", "#1A1A1A", "#2A2A2A"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Profile</Text>
            <LinearGradient
              colors={["#7C4DFF", "#8A84FF"]}
              style={styles.titleUnderline}
            />
          </View>
          <LinearGradient
            colors={["rgba(124, 77, 255, 0.2)", "rgba(124, 77, 255, 0.1)"]}
            style={styles.headerIcon}
          >
            <FontAwesome5 name="user" size={20} color="#7C4DFF" />
          </LinearGradient>
        </View>

        {/* Profile Section */}
        <LinearGradient
          colors={["rgba(30, 30, 30, 0.9)", "rgba(42, 42, 42, 0.9)"]}
          style={styles.profileSection}
        >
          {/* Profile Picture - Email Initial Avatar */}
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={getAvatarColor(email)}
              style={styles.avatarContainer}
            >
              <Text style={styles.avatarText}>
                {getInitialsFromEmail(email)}
              </Text>
            </LinearGradient>
            <View style={styles.onlineIndicator}></View>
          </View>

          {/* User Info */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </LinearGradient>

        {/* Logout Button - FIXED */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={["#FF4081", "#FF6B6B"]}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
    fontFamily: "System",
  },
  titleUnderline: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  profileSection: {
    alignItems: "center",
    padding: 28,
    marginBottom: 20,
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(124, 77, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "bold",
    fontFamily: "System",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#1A1A1A",
  },
  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
    fontFamily: "System",
  },
  email: {
    color: "#B0B0B0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 6,
    fontFamily: "System",
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
    fontSize: 17,
    fontFamily: "System",
  },
});

export default Profile;
