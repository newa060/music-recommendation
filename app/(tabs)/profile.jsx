import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Music is the language of my soul 🎧");
  const [genres, setGenres] = useState(["Pop", "Jazz", "Lo-Fi", "Chill"]);
  const router = useRouter();

  // ✅ Load user info from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setName(userData.name || "User");
        setEmail(userData.email || "");
      }
    };
    loadUser();
  }, []);

  // ✅ Logout function
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    alert("Logged out successfully!");
    router.push("/signin");
  };

  const [userId, setUserId] = useState(null);

React.useEffect(() => {
  const loadUserId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
  };
  loadUserId();
}, []);


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: "https://i.pinimg.com/736x/7c/fe/d2/7cfed2f29d7cfab3c7c7c0f44f89b6b1.jpg",
          }}
          style={styles.profileImage}
        />

        {isEditing ? (
          <>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />
            <TextInput
              style={[styles.input, styles.bioInput]}
              multiline
              value={bio}
              onChangeText={setBio}
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.bio}>{bio}</Text>
          </>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={async () => {
  if (isEditing) {
    if (!userId) {
      alert("User ID not found");
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.106:3000/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  }
  setIsEditing(!isEditing);
}}


        >
          <Feather name={isEditing ? "check" : "edit"} size={18} color="#fff" />
          <Text style={styles.editButtonText}>
            {isEditing ? "Save" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Favorite Genres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎵 Favorite Genres</Text>
        <View style={styles.genresContainer}>
          {genres.map((genre, index) => (
            <View key={index} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Music Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Music Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityBox}>
            <MaterialIcons name="favorite" size={24} color="#ff7675" />
            <Text style={styles.activityText}>120 Likes</Text>
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="musical-notes-outline" size={24} color="#74b9ff" />
            <Text style={styles.activityText}>8 Playlists</Text>
          </View>
          <View style={styles.activityBox}>
            <Feather name="clock" size={24} color="#55efc4" />
            <Text style={styles.activityText}>5h Listening</Text>
          </View>
        </View>
      </View>

      {/* ✅ Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// your existing styles (no change)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101010" },
  contentContainer: { paddingVertical: 20, paddingHorizontal: 10 },
  profileSection: { alignItems: "center", padding: 30, marginBottom: 10 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ff7675",
    marginBottom: 15,
  },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
  email: { color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 10 },
  bio: { color: "#ccc", fontSize: 14, marginVertical: 8, textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },
  input: { backgroundColor: "#222", color: "#fff", width: "90%", borderRadius: 8, padding: 10, marginVertical: 6, textAlign: "center", fontSize: 14 },
  bioInput: { height: 60, textAlignVertical: "top" },
  editButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff7675", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 15 },
  editButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 14 },
  section: { marginHorizontal: 15, marginVertical: 12 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  genresContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  genreTag: { backgroundColor: "#333", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, margin: 4 },
  genreText: { color: "#fff", fontSize: 12 },
  activityContainer: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  activityBox: { alignItems: "center", backgroundColor: "#1e1e1e", padding: 12, borderRadius: 12, flex: 1, minHeight: 80, justifyContent: "center" },
  activityText: { color: "#fff", fontSize: 12, marginTop: 6, textAlign: "center" },
  logoutButton: { backgroundColor: "#e74c3c", flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 50, padding: 14, borderRadius: 25, marginTop: 20, marginBottom: 30 },
  logoutText: { color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 14 },
});

export default Profile;
