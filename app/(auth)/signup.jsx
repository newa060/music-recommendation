import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  TextInput,
  Alert
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/images/aatmabeat.png";
import { Formik } from "formik";
import validationSchema from "../../utils/authSchema";

const Signup = () => {
  const router = useRouter();



   // Function to call your backend API
  const handleSignup = async (values) => {
    try {
      const response = await fetch("http://192.168.1.106:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert("Success", data.message);
        router.push("/signin");
      } else {
        Alert.alert("Error", data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to connect to server");
    }
  };


  return (
    <SafeAreaView className="bg-[#2b2b2b]">
      <StatusBar barStyle={"light-content"} backgroundColor={"#white"} />
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-20 flex justify-center items-center">
          <Image source={logo} style={{ width: 400, height: 100 }} />
          <Text className="text-lg text-center text-white font-bold mb-10">
            Let's get you started
          </Text>

          <View className="w-5/6">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View className="w-full">
                  {/* Email */}
                  <Text className="text-[#f49b33] mt-4 mb-3">Email</Text>
                  <TextInput
                    className="h-10 border border-white text-white rounded px-2"
                    keyboardType="email-address"
                    onChangeText={handleChange("email")}
                    value={values.email}
                    onBlur={handleBlur("email")}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.email}
                    </Text>
                  )}

                  {/* Password */}
                  <Text className="text-[#f49b33] mt-4 mb-3">Password</Text>
                  <TextInput
                    className="h-10 border border-white text-white rounded px-2"
                    secureTextEntry
                    onChangeText={handleChange("password")}
                    value={values.password}
                    onBlur={handleBlur("password")}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.password}
                    </Text>
                  )}

                  {/* Signup Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="p-2 my-2 bg-[#f49b33] text-black rounded-lg mt-10"
                  >
                    <Text className="text-xl font-sembold text-center">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            {/* Navigation Links */}
            <View className="flex justify-center item-center">
              <TouchableOpacity
                className="flex flex-row justify-center mt-5 p-2 items-center"
                onPress={() => router.push("/signin")}
              >
                <Text className="text-white font-semibold">
                  Already a User?{" "}
                </Text>
                <Text className="text-base font-sembold underline text-[#f49b33]">
                  Sign in
                </Text>
              </TouchableOpacity>

              <Text className="text-center text-base font-semibold mb-4 text-white">
                <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" /> or{" "}
                <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" />
              </Text>

              <TouchableOpacity
                className="flex flex-row justify-center mb-5 p-2 items-center"
                onPress={() => router.push("/home")}
              >
                <Text className="text-white font-semibold">Be a</Text>
                <Text className="text-base font-sembold underline text-[#f49b33]">
                  {" "}
                  Guest User
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
