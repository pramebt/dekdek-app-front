// Login.tsx
import React, { FC, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingScreenAdvice } from "../components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";

import { MyInput } from "./ui/Myinput";
import { setFirstName, setLastName } from "../app/user-slice";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// Define API URL
import { API_ENDPOINT, API_LOGIN } from "@env";

// Define Validation Schema
const LoginSchema = z.object({
  userNameOrEmail: z.string({
    required_error: "กรุณาระบุชื่อผู้ใช้ หรืออีเมล",
  }),
  password: z.string({ required_error: "กรุณาระบุรหัสผ่าน" }),
});

// Type Definitions
type LoginModel = z.infer<typeof LoginSchema>;

export const Login: FC = () => {
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();
  // ✅ สร้าง state สำหรับเปิด/ปิดการซ่อนรหัสผ่าน
  const [isSecure, setIsSecure] = useState(true);

  // Form Handling
  const {
    control,
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginModel>({
    resolver: zodResolver(LoginSchema),
  });

  const dispatch = useDispatch();

  // === ( Handle Login API Call ) ===
  const validatePass: SubmitHandler<LoginModel> = async (form) => {
    console.log(form);

    // send form data to api server
    try {
      const resp = await fetch(`${API_ENDPOINT}/${API_LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userNameOrEmail: form.userNameOrEmail,
          password: form.password,
        }),
      });

      if (!resp.ok) {
        // Handle specific HTTP status codes
        if (resp.status === 401) {
          throw new Error("Invalid username or password");
        } else if (resp.status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error("Unexpected error occurred");
        }
      }

      const jsonResp = await resp.json();

      if (resp.status === 200) {
        Alert.alert("เข้าระบบสำเร็จ");
        console.log("Form submitted Sir'Benz:", form);
        console.log("API Response JSON Sir'Benz:", jsonResp);

        if (jsonResp.success) {
          const { token, user, refreshToken } = jsonResp;

          if (!user) {
            Alert.alert("Login Error", "User data not found");
            return;
          }

          const { userId, userName, email, phoneNumber, role } = user;

          // จัดเก็บข้อมูลใน AsyncStorage
          await AsyncStorage.multiSet([
            ["userToken", token],
            ["refreshToken", refreshToken],
            ["userId", JSON.stringify(userId)], // Stringify userId
            ["userName", userName],
            ["email", email],
            ["phoneNumber", phoneNumber],
            ["userRole", role],
          ]);

          console.log("User data saved Sir'Benz!");
          console.log("refreshToken: ", refreshToken);

          // อัพเดท state ของ Redux (หรือสถานะที่ใช้)
          // dispatch(setFirstName(firstName));
          // dispatch(setLastName(lastName));

          if (role == "parent") {
            navigation.reset({
              index: 0,
              routes: [{ name: "mainPR" }],
            });
          } else if (role == "supervisor") {
            navigation.reset({
              index: 0,
              routes: [{ name: "mainSP" }],
            });
          } else if (role == "admin") {
            navigation.navigate("mainAD");
          } else {
            console.log("Unknown role:", role);
            Alert.alert("Error", "Unknown user role");
          }
        } else {
          Alert.alert("เข้าระบบไม่สำเร็จ", "กรุณาลองอีกครั้ง");
        }
      } else {
        Alert.alert(
          "เข้าระบบไม่สำเร็จ",
          "กรุณาใส่ username password ให้ครบถ้วน"
        );
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Login Failed", "Invalid username or password");
    }
  };

  //================================================================================================
  // ==== Navigation Functions ====
  const whenGotoRegister = () => {
    navigation.navigate("register");
  };

  const whenForgotPassword = () => {
    navigation.navigate("forgetPassword");
  };

  //================================================================================================

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaProvider>
        <ImageBackground
          source={require("../assets/background/bg2.png")}
          style={styles.background}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
              <Text style={styles.header}>SIGN IN</Text>
              <View style={styles.form}>
                <View>
                  <MyInput
                    label="USERNAME or EMAIL"
                    name="userNameOrEmail"
                    control={control}
                  />
                </View>
                {/* ช่องกรอกรหัสผ่าน พร้อมไอคอนดวงตา */}
                <View>
                  <MyInput
                    label="PASSWORD"
                    name="password"
                    control={control}
                    isSecure={isSecure}
                  />
                  <TouchableOpacity
                    onPress={() => setIsSecure(!isSecure)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={isSecure ? "eye-off" : "eye"}
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Pressable onPress={whenForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </Pressable>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={styles.signinButton}
                  onPress={handleSubmit(validatePass)}
                >
                  <Text style={styles.buttonText}>SIGN IN</Text>
                </Pressable>
              </View>
              <View>
                <Text style={styles.title}>Don't have an account?</Text>
              </View>
              <View>
                <Pressable onPress={whenGotoRegister}>
                  <Text style={styles.signupText}>SIGN UP</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaProvider>
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
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    width: "80%",
    alignItems: "center",
    marginVertical: 20,
  },
  forgotPassword: {
    marginVertical: 5,
    fontSize: 15,
    textAlign: "center",
    marginTop: -20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  signinButton: {
    width: "60%",
    backgroundColor: "#f5d2f5",
    borderColor: "black",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  signupText: {
    color: "#000",
    textAlign: "center",
    marginTop: 5,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    width: "85%", // Ensure errorText has the same width as TextInput
    textAlign: "left", // Align error text to the left
    marginBottom: 10, // Add space between error text and other elements
    marginLeft: 40, // Adjust this value to move errorText to the right
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 22,
  },
});

export default Login;
