// ForgetPassword.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Image,
} from "react-native";

import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ForgotPasswordProps {
  navigation: NavigationProp<any>;
}

// Define API URL
import { API_ENDPOINT, API_FORGOTPASSWORD } from "@env";

export const ForgetPassword = ({ navigation }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");

  // === ( Handle Forgot Password API Call ) ===
  const handleForgotPassword = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(`${API_ENDPOINT}/${API_FORGOTPASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //
        },
        body: JSON.stringify({ email }),
      });

      const jsonResponse = await response.json();

      if (response.ok && jsonResponse.success) {
        Alert.alert(
          "เราได้ส่งอีเมลสำหรับตั้งค่ารหัสผ่านใหม่ให้คุณเรียบร้อยแล้ว",
          "กรุณาตรวจสอบอีเมลของคุณ คลิก URL ที่ปรากฎในอีเมลเพื่อทำการรีเซ็ตรหัสผ่านใหม่ ภายใน 1 ชั่วโมง!"
        );
        navigation.goBack();
      } else {
        Alert.alert("Error", jsonResponse.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // Navigate function
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../assets/background/bg2.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Forgot Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Pressable style={styles.button} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </Pressable>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={goBack}>
              <Image
                source={require("../assets/icons/back.png")}
                style={styles.Icon}
              />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    minHeight: 650,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "90%",
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },

  bottomSection: {
    width: "auto",
    height: "15%",
    paddingTop: 30,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "40%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },
});
