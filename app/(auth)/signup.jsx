import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import logo from "../../assets/images/aatmabeat.png";
import { useMusic } from "../../context/MusicContext";
import { useSession } from "../../context/SessionContext";

// ✅ Enhanced validation schema with better email validation
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Email must contain a valid domain (e.g., example@gmail.com)"
    )
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Signup = () => {
  const router = useRouter();
  const { stopMusic } = useMusic();
  const { isLoading: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    stopMusic(); // stops music whenever this screen mounts
  }, []);

  // ✅ Additional email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  // Show loading screen while session is being checked
  if (sessionLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handleSignup = async (values) => {
    // ✅ Double-check email validation before API call
    if (!isValidEmail(values.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address with proper domain (e.g., example@gmail.com)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://192.168.18.240:3000/signup", {
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
      Alert.alert("Error", "Unable to connect to server. Please check your connection.");
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={logo} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                dirty,
              }) => (
                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Ionicons name="mail-outline" size={16} color="#6C63FF" />
                      <Text style={styles.labelText}>Email Address</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        touched.email && errors.email ? styles.inputError : 
                        touched.email && !errors.email ? styles.inputSuccess : null
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="#666"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                    />
                    {touched.email && errors.email ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="warning-outline" size={14} color="#FF6B6B" />
                        <Text style={styles.errorText}>{errors.email}</Text>
                      </View>
                    ) : touched.email && !errors.email ? (
                      <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#1DB954" />
                        <Text style={styles.successText}>Valid email format</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Ionicons name="lock-closed-outline" size={16} color="#6C63FF" />
                      <Text style={styles.labelText}>Password</Text>
                    </View>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          touched.password && errors.password ? styles.inputError : 
                          touched.password && !errors.password ? styles.inputSuccess : null
                        ]}
                        placeholder="Create a password"
                        placeholderTextColor="#666"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
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
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="warning-outline" size={14} color="#FF6B6B" />
                        <Text style={styles.errorText}>{errors.password}</Text>
                      </View>
                    ) : touched.password && !errors.password ? (
                      <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#1DB954" />
                        <Text style={styles.successText}>Password is secure</Text>
                      </View>
                    ) : (
                      <Text style={styles.hintText}>
                       
                      </Text>
                    )}
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity 
                    style={[
                      styles.signUpButton,
                      (!isValid || !dirty || isLoading) && styles.signUpButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!isValid || !dirty || isLoading}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text style={styles.signUpButtonText}>Creating Account...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="person-add-outline" size={20} color="#fff" />
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
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Alternative Options */}
            <View style={styles.alternativeOptions}>
              {/* Guest Access */}
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => router.push("/home")}
              >
                <View style={styles.guestIcon}>
                  <MaterialIcons name="person-outline" size={20} color="#6C63FF" />
                </View>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signin")}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing up, you agree to our Terms and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 350,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  formContainer: {
    flex: 1,
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
    marginBottom: 8,
  },
  labelText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  inputSuccess: {
    borderColor: '#1DB954',
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
    top: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 4,
  },
  successText: {
    color: '#1DB954',
    fontSize: 12,
    marginLeft: 4,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  signUpButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#666',
    fontSize: 14,
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
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
};

export default Signup;