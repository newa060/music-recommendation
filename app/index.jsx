import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../assets/images/aatmabeat.png";
import validationSchema from "../utils/authSchema";


const Signup = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Replace the handleSignup function in app/index.jsx with this:

const handleSignup = async (values) => {
  setIsLoading(true);
  try {
    const response = await fetch("http://192.168.18.240:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (response.status === 201) {
      Alert.alert("Welcome to Aatmabeat!", "Your account has been created successfully!");
      router.push("/signin");
    } else {
      Alert.alert("Signup Failed", data.message || "Please try again with different credentials");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Connection Error", "Unable to connect to server. Please check your internet connection.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Animated Header Section */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={logo} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <FontAwesome5 name="music" size={24} color="#6C63FF" />
              </View>
              <Text style={styles.title}>Welcome to Aatmabeat</Text>
              <View style={styles.titleUnderline}></View>
              
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.formCard}>
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
                  <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <View style={styles.inputLabel}>
                        <Ionicons name="mail-outline" size={18} color="#6C63FF" />
                        <Text style={styles.labelText}>Email Address</Text>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          touched.email && errors.email ? styles.inputError : null
                        ]}
                        placeholder="Enter your email address"
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        value={values.email}
                      />
                      {touched.email && errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <View style={styles.inputLabel}>
                        <Ionicons name="lock-closed-outline" size={18} color="#6C63FF" />
                        <Text style={styles.labelText}>Password</Text>
                      </View>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.passwordInput,
                            touched.password && errors.password ? styles.inputError : null
                          ]}
                          placeholder="Create a secure password"
                          placeholderTextColor="#666"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          value={values.password}
                        />
                        <TouchableOpacity 
                          style={styles.eyeIcon}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={22} 
                            color="#888" 
                          />
                        </TouchableOpacity>
                      </View>
                      {touched.password && errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity 
                      style={[
                        styles.signUpButton,
                        isLoading && styles.signUpButtonDisabled
                      ]}
                      onPress={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <Ionicons name="refresh" size={22} color="#fff" />
                          <Text style={styles.signUpButtonText}>Creating Account...</Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Ionicons name="person-add-outline" size={22} color="#fff" />
                          <Text style={styles.signUpButtonText}>Sign Up</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Alternative Options */}
              <View style={styles.alternativeOptions}>
                <TouchableOpacity 
                  style={styles.guestButton}
                  onPress={() => router.push("/home")}
                >
                  <View style={styles.guestIcon}>
                    <MaterialIcons name="person-outline" size={20} color="#6C63FF" />
                  </View>
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/signin")}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

      
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 360,
    height: 130,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#6C63FF',
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formContainer: {
    flex: 1,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  signUpButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  alternativeOptions: {
    alignItems: 'center',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  guestIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#888',
    fontSize: 14,
  },
  signInLink: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
};

export default Signup;