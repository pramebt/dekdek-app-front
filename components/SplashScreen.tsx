import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  LoadingScreenHello,
  LoadingScreenToy,
  LoadingScreenWelcome,
} from "../components/LoadingScreen";

export const SplashScreen: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [fadeAnim] = useState(new Animated.Value(0)); // เริ่มจาก opacity 0

  useEffect(() => {
    // ทำให้ Header & Title ค่อยๆ แสดงหลังจาก 2 วินาที
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1, // opacity -> 1
        duration: 1000, // 1 วินาที
        useNativeDriver: false, // เปลี่ยนเป็น false ถ้าไม่แสดงผล
      }).start();
    }, 1000);

    // ตรวจสอบสถานะล็อกอิน
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      const userRole = await AsyncStorage.getItem("userRole");

      setTimeout(() => {
        if (userToken && userRole) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  userRole === "parent"
                    ? "mainPR"
                    : userRole === "admin"
                    ? "mainAD"
                    : "mainSP",
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "welcome" }],
          });
        }
      }, 4000); // เปลี่ยนหน้าใน(วินาที)
    };

    checkLoginStatus();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/background/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* แสดง Loading ก่อน */}
        <View style={styles.helloLoading}>
          <LoadingScreenWelcome />
        </View>

        {/* แสดง Header & Title พร้อม Fade-in Animation */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>to</Text>
          <Text style={styles.header}>DekDek</Text>
        </Animated.View>

        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={{ marginTop: 20 }}
        />
      </View>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  helloLoading: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 60,
  },
  textContainer: {
    flexDirection: "column", // จัดเรียง title และ header ในบรรทัดเดียวกัน
    alignItems: "center", // จัดให้ baseline ของตัวอักษรตรงกัน
    marginTop: 5,
  },
  title: {
    fontSize: 20,
    color: "#000",
    marginBottom: 5,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 7, // เพิ่มระยะห่างระหว่าง title กับ header
  },
});

export default SplashScreen;
