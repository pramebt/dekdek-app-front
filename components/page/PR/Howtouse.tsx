import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingScreenBaby } from "../../LoadingScreen";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const HowToUse: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../../../assets/background/bg2.png")}
      style={styles.background}
    >
      {/* <SafeAreaView style={{ flex: 1 }}> */}
      <Text style={styles.header}>คู่มือการใช้งาน</Text>
      <View style={styles.midSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.ScrollView}
        >
          <View style={styles.howtousesection}>
            <Image
              source={require("../../../assets/images/howtouse.png")}
              style={styles.howtouseImage}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </View>
      {/* Bottom Section */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Image
            source={require("../../../assets/icons/back.png")}
            style={styles.Icon}
          />
        </Pressable>
      </View>
      {/* </SafeAreaView> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    //borderWidth: 2,
  },
  ScrollView: {
    width: "100%",
  },
  midSection: {
    width: "95%",
    height: "70%",
    justifyContent: "center",
  },

  howtousesection: {
    alignItems: "center",
    width: "100%",
    height: "auto",
  },
  howtouseImage: {
    width: "100%",
    height: 918,
  },
  bottomSection: {
    width: "auto",
    height: "15%",
    paddingTop: 30,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    width: "80%",
    //borderWidth:1,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "60%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },

  // ----------------------------------------------------------------------------------
  IntroContainer: {
    width: "95%",
    marginLeft: 4,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCardIntro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 30,
    width: "90%",
    height: 130,
    marginHorizontal: "auto",
    marginTop: 10,
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 18,
    marginTop: 10,
    backgroundColor: "#B2AAFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailTextIntro: {
    fontSize: 14,
    color: "#fff",
    padding: 2,
  },
  TextIntro: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
