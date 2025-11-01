import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/images/aatmabeat.png";
import { Formik } from 'formik';
import validationSchema from '../../utils/authSchema';
import AsyncStorage from "@react-native-async-storage/async-storage";


const Signup = () => {
    const router =useRouter();
    
    const handleSignin = async (values) => {
  try {
    const response = await fetch("http://192.168.1.106:3000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
     
      alert("Login successful!");
      // ✅ Navigate to home after successful login
      router.push("/home");
    } else {
      alert(data.message || "Invalid email or password");
    }
  } catch (error) {
    console.error("Signin error:", error);
    alert("Error connecting to server");
  }
};


  return (
    <SafeAreaView className={`bg-[#2b2b2b]`}>
      <StatusBar barStyle={"light-content"} backgroundColor={"#white"}/>
      <ScrollView contentContainerStyle={{height:"100%"}}>
        <View className="m-20 flex justify-center items-center">
          <Image source={logo} style={{width:400,height:100}}/>
          <Text className="text-lg text-center text-white font-bold mb-10">
             Let's get you started
            </Text>
      
        <View className="w-5/6">
        <Formik
         initialValues={{email:"",password:""}} 
        validationSchema={validationSchema} 
        onSubmit={handleSignin} >
            {({handleChange,handleBlur,handleSubmit,values,errors,touched}) => (               
               <View className="w-full">
                <Text className="text-[#f49b33] mt-4 mb-3">Email</Text>
                <TextInput
                className="h-10 border border-white text-white rounded px-2"
                keyboardType="email-address" 
                onChangeText={handleChange("email")}
                value={values.email} 
                onBlur={handleBlur("email")}
                />  

                {touched.email && errors.email && (<Text className="text-red-500 text-xs mb-2">
                  {errors.email}
                  </Text>)}  

                  <Text className="text-[#f49b33] mt-4 mb-3">Password</Text>
                <TextInput
                className="h-10 border border-white text-white rounded px-2"
                secureTextEntry
                onChangeText={handleChange("password")}
                value={values.password} 
                onBlur={handleBlur("password")}
                />  

                {touched.password && errors.password && (<Text className="text-red-500 text-xs mb-2">
                  {errors.password}
                  </Text>)} 

                   <TouchableOpacity 
                   onPress={handleSubmit} 
                   className="p-2 my-2 bg-[#f49b33] text-black rounded-lg mt-10">
          <Text className="text-xl font-sembold text-center">
            Sign In
          </Text>
        </TouchableOpacity>     

               </View>
            )}
        </Formik>   

       <View className="flex justify-center item-center">
                 <TouchableOpacity 
                   className="flex flex-row justify-center mt-5 p-2 items-center"
                   onPress={()=>router.push("/signup")}> 
                     <Text className="text-white font-semibold">New User? {" "}</Text>
                     <Text className="text-base font-sembold underline text-[#f49b33]">
                       Sign up
                     </Text>
                   </TouchableOpacity>
                   <Text className="text-center text-base font-semibold mb-4 text-white">
                   <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" /> or{" "} 
                   <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" />
                   </Text>
                          <TouchableOpacity 
                   className="flex flex-row justify-center mb-5 p-2 items-center"
                   onPress={()=>router.push("/home")}> 
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
}

export default Signup