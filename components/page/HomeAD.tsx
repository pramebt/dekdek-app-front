import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import {
  usePushNotifications,
  sendExpoPushTokenToBackend,
} from "../../app/usePushNotifications";

import { LoadingScreenBaby } from "../LoadingScreen";
import LottieView from "lottie-react-native";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const HomeAD: FC = () => {
  // useState
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate

  const whenGotoUserList = () => {
    navigation.navigate("userList");
  };

  const whenGotoChildList = () => {
    navigation.navigate("childList");
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // return
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg2.png")}
        style={styles.background}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* Choose Users Section */}
            <Pressable
              style={styles.startassessmentsSection}
              onPress={whenGotoUserList}
            >
              <LinearGradient
                colors={["#FFFFFF", "#c7eedb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1.5 }}
                style={styles.evaluateButton}
              >
                <Image
                  source={require("../../assets/icons/User_Icon.png")}
                  style={styles.asessmentIcon}
                />
                <Text style={styles.evaluateText}>Users List</Text>
              </LinearGradient>
            </Pressable>
            {/* Choose Child Section */}
            <Pressable
              style={styles.startassessmentsSection}
              onPress={whenGotoChildList}
            >
              <LinearGradient
                colors={["#FFFFFF", "#c7eedb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1.5 }}
                style={styles.evaluateButton}
              >
                <Image
                  source={require("../../assets/icons/boy.png")}
                  style={styles.asessmentIcon}
                />
                <Text style={styles.evaluateText}>Children List</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: "80%",
    // paddingTop: "5%",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 2,
  },
  background: {
    flex: 1,
    // resizeMode: "cover",
    // height: 850,
    height: "100%",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------

  startassessmentsSection: {
    alignItems: "center",
    width: "90%",
    height: "auto",
    marginBottom: 20,
    // borderWidth: 2,
  },
  evaluateButton: {
    backgroundColor: "#ccfff5",
    flexDirection: "row",
    width: "100%",
    height: 110,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  asessmentIcon: {
    width: 65,
    height: 65,
    marginLeft: "auto",
    marginRight: 20,
    //borderWidth:2,
  },
  evaluateText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    //marginHorizontal: 20,
    marginRight: "auto",
  },
});
