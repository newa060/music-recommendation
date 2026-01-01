import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusic } from "../../context/MusicContext";
import { useSession } from "../../context/SessionContext";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { stopMusic } = useMusic();
  const { signOut, user: sessionUser } = useSession();


  // Load user info from AsyncStorage
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
      const storedUserId = await AsyncStorage.getItem('userId') || 
                          await AsyncStorage.getItem('userID') || 
                          await AsyncStorage.getItem('id') ||
                          await AsyncStorage.getItem('user_id');
      
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

  // Logout function
const handleLogout = async () => {
  await stopMusic();  // Stop the currently playing music
  await signOut();    // Use session context signOut
  alert("Logged out successfully!");
};


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.titleUnderline}></View>
        </View>
        <View style={styles.headerIcon}>
          <FontAwesome5 name="user" size={20} color="#6C63FF" />
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://i.pinimg.com/736x/7c/fe/d2/7cfed2f29d7cfab3c7c7c0f44f89b6b1.jpg",
            }}
            style={styles.profileImage}
          />
          <View style={styles.onlineIndicator}></View>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0A0A0A" 
  },
  contentContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 60,
    paddingBottom: 30 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 50,
    height: 4,
    backgroundColor: "#6C63FF",
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  profileSection: { 
    alignItems: "center", 
    padding: 24, 
    marginBottom: 10,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#6C63FF",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4ECDC4",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  name: { 
    color: "#fff", 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  email: { 
    color: "#888", 
    fontSize: 14, 
    textAlign: "center", 
    marginBottom: 12,
  },
  logoutButton: { 
    backgroundColor: "#FF6B6B", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 24,
    marginBottom: 10,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "600", 
    marginLeft: 8, 
    fontSize: 16,
  },
});

export default Profile;