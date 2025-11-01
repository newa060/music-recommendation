import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Home = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const router = useRouter(); 

  const handleSearch = () => {
    // handle search logic here (music API or local data)
    console.log("Searching for:", searchText);
  };

  const handleFaceDetection = () => {
    // Navigate to face detection screen
   router.push("/FaceDetection");
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Aatmabeat </Text>
      <Text style={styles.subtitle}>Find music that matches your mood</Text>

      {/* Search Bar + Face Detection */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for songs, artists..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.faceButton} onPress={handleFaceDetection}>
          <MaterialIcons name="face" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

   
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingLeft: 5,
  },
  searchButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    padding: 8,
    marginLeft: 6,
  },
  faceButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    padding: 8,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    marginTop: 30,
    marginBottom: 10,
    fontWeight: "600",
  },
  card: {
    marginRight: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    width: 140,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardText: {
    color: "#fff",
    padding: 10,
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#888",
    fontSize: 13,
  },
});

export default Home;
