// GM.tsx
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoadingScreenAdvice,
  LoadingScreenBook,
  LoadingScreenPassAll,
  LoadingScreenSearchfile,
} from "../../LoadingScreen";
import { Child } from "../../page/SP/HomeSP";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";

type HistoryRouteProp = RouteProp<
  {
    assessment: { child: Child; aspect: string; assessment: AssessmentDetails };
  },
  "assessment"
>;

export interface AssessmentDetails {
  details: any;
  assessment_details_id: number;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_succession: string;
  assessmentInsert_id: number;
  supervisor_assessment_id: number;
  assessment_id: number;
}

export interface AssessmentInsert {
  // assessment_id: number;
  supervisor_assessment_id: number;
}

export interface UserId {
  // user_id: number;
  supervisor_id: number;
}

// Define API URL
import { API_ENDPOINT, API_UPDATE_NOT_PASSED, API_UPDATE_PASSED } from "@env";

export const AssessmentRetryPR: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<HistoryRouteProp>();
  const { child } = route.params;
  const { aspect } = route.params;
  const { assessment } = route.params;

  // console.log("assessment:", assessment);
  // console.log("API URL: ", API_UPDATE_NOT_PASSED);

  // ฟังก์ชันเพื่อแปลงอายุจากสตริงเป็นจำนวนเดือน
  const convertAgeToMonths = (age: string): number => {
    const [years, months] = age.split(" ปี ").map((part) => parseInt(part, 10));
    return years * 12 + months;
  };

  // useState
  const [userId, setUserId] = useState<UserId | null>(null);
  const [assessmentDetails, setAssessmentDetails] =
    useState<AssessmentDetails | null>(null);
  const [assessmentInsert, setAssessmentInsert] =
    useState<AssessmentInsert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleNotPassed, setModalVisibleNotPassed] = useState(false);
  const [modalVisibleHistory, setModalVisibleHistory] = useState(false);

  // useEffect

  // console.log("child:", child.age);

  const childAgeInMonths = convertAgeToMonths(child.age?.toString() || "");

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // TEST ASSESSMENT ID USED
  // useEffect(() => {
  //   if (assessment) {
  //     console.log(
  //       "Current assessment supervisor_assessment_id:",
  //       assessment.supervisor_assessment_id
  //     );
  //     console.log(
  //       "Current assessment assessment_id:",
  //       assessment.assessment_id
  //     );
  //   } else {
  //     console.log("assessment is null or undefined");
  //   }
  // }, [assessment]);

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // calculateAgeRange

  const calculateAgeRange = (minMonths: number, maxMonths: number): string => {
    const formatAge = (months: number) => {
      if (isNaN(months)) return ""; // ถ้า NaN ให้คืนค่าเป็น string ว่าง
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ปี ${remainingMonths} เดือน`;
    };

    const minAge = formatAge(minMonths);
    const maxAge = formatAge(maxMonths);

    // ถ้ามีค่าทั้งสอง ให้เชื่อมด้วย " - " แต่ถ้ามีค่าเดียวให้แสดงเฉพาะค่านั้น
    if (minAge && maxAge) return `${minAge} - ${maxAge}`;
    return minAge || maxAge || "ข้อมูลไม่สมบูรณ์";
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate

  const whenGotoHomeSP = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  // ListHistory
  const ListHistory = (child: Child, aspect: string) => {
    setModalVisibleHistory(false);
    navigation.navigate("listhistorypr", { child, aspect });
  };

  // whenGotoAssessment
  const whenGotoAssessment = (child: Child, aspect: string) => {
    navigation.navigate("assessmentpr", { child, aspect });
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentDevice
  const renderAssessmentDevice = () => {
    if (!assessment.details) {
      console.log("assessmentDetails is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetails ไม่มีค่า null
    }

    // console.log("assessmentDetails:", assessmentDetails);

    if (
      assessment.details.assessment_device_name === "none" &&
      assessment.details.assessment_device_image === "none" &&
      assessment.details.assessment_device_detail === "none"
    ) {
      return null; // ไม่แสดง renderAssessmentDevice
    }

    return (
      <View style={styles.assessmentDevice}>
        {assessment.details.assessment_device_name !== "none" && (
          <Text style={styles.deviceText}>
            อุปกรณ์: {assessment.details.assessment_device_name}
          </Text>
        )}
        {assessment.details.assessment_device_image !== "none" && (
          <Image
            source={getImageSource(
              assessment.details.assessment_device_image ?? ""
            )}
            style={styles.deviceIcon}
            resizeMode="contain"
          />
        )}
        {assessment.details.assessment_device_detail !== "none" && (
          <Text style={styles.deviceDetail}>
            {assessment.details.assessment_device_detail}
          </Text>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // imageMap
  interface ImageMap {
    [key: string]: any;
  }

  const imageMap: ImageMap = {
    "GM1.jpg": require("../../../assets/assessment/GM/GM1.jpg"),
    "GM2.jpg": require("../../../assets/assessment/GM/GM2.jpg"),
    "GM3.jpg": require("../../../assets/assessment/GM/GM3.jpg"),
    "GM4.jpeg": require("../../../assets/assessment/GM/GM4.jpeg"),
    "GM5.jpg": require("../../../assets/assessment/GM/GM5.jpg"),
    "GM6.jpg": require("../../../assets/assessment/GM/GM6.jpg"),
    "GM7.jpg": require("../../../assets/assessment/GM/GM7.jpg"),
    "GM8.jpg": require("../../../assets/assessment/GM/GM8.jpg"),
    "GM9.jpg": require("../../../assets/assessment/GM/GM9.jpg"),
    "GM10.jpg": require("../../../assets/assessment/GM/GM10.jpg"),
    "GM11.jpg": require("../../../assets/assessment/GM/GM11.jpg"),
    "GM12.jpg": require("../../../assets/assessment/GM/GM12.jpg"),
    "GM13.jpg": require("../../../assets/assessment/GM/GM13.jpg"),
    "GM14.jpg": require("../../../assets/assessment/GM/GM14.jpg"),
    "GM15.jpg": require("../../../assets/assessment/GM/GM15.jpg"),
    "GM16.jpg": require("../../../assets/assessment/GM/GM16.jpg"),
    "GM17.jpg": require("../../../assets/assessment/GM/GM17.jpg"),
    "GM18.jpg": require("../../../assets/assessment/GM/GM18.jpg"),
    "GM19.jpg": require("../../../assets/assessment/GM/GM19.jpg"),
    "GM20.jpg": require("../../../assets/assessment/GM/GM20.jpg"),
    "GM21.jpg": require("../../../assets/assessment/GM/GM21.jpg"),
    "GM22.jpg": require("../../../assets/assessment/GM/GM22.jpg"),
    "GM23.jpg": require("../../../assets/assessment/GM/GM23.jpg"),
    "GM24.jpg": require("../../../assets/assessment/GM/GM24.jpg"),
    "GM25.jpg": require("../../../assets/assessment/GM/GM25.jpg"),
    "GM26.jpg": require("../../../assets/assessment/GM/GM26.jpg"),
    "GM27.jpg": require("../../../assets/assessment/GM/GM27.jpg"),
    "GM28.jpg": require("../../../assets/assessment/GM/GM28.jpg"),

    "FM1.jpg": require("../../../assets/assessment/FM/FM1.jpg"),
    "FM2.jpg": require("../../../assets/assessment/FM/FM2.jpg"),
    "FM3.jpg": require("../../../assets/assessment/FM/FM3.jpg"),
    "FM4.jpg": require("../../../assets/assessment/FM/FM4.jpg"),
    "FM5.jpg": require("../../../assets/assessment/FM/FM5.jpg"),
    "FM6.jpg": require("../../../assets/assessment/FM/FM6.jpg"),
    "FM7.jpg": require("../../../assets/assessment/FM/FM7.jpg"),
    "FM8.jpg": require("../../../assets/assessment/FM/FM8.jpg"),
    "FM9.jpg": require("../../../assets/assessment/FM/FM9.jpg"),
    "FM10.jpg": require("../../../assets/assessment/FM/FM10.jpg"),
    "FM11.jpg": require("../../../assets/assessment/FM/FM11.jpg"),
    "FM12.jpg": require("../../../assets/assessment/FM/FM12.jpg"),
    "FM13.jpg": require("../../../assets/assessment/FM/FM13.jpg"),
    "FM14.jpg": require("../../../assets/assessment/FM/FM14.jpg"),
    "FM15.jpg": require("../../../assets/assessment/FM/FM15.jpg"),
    "FM16.jpg": require("../../../assets/assessment/FM/FM16.jpg"),
    "FM17.jpg": require("../../../assets/assessment/FM/FM17.jpg"),
    "FM18.jpg": require("../../../assets/assessment/FM/FM18.jpg"),
    "FM19.jpg": require("../../../assets/assessment/FM/FM19.jpg"),
    "FM20.jpg": require("../../../assets/assessment/FM/FM20.jpg"),
    "FM21.jpg": require("../../../assets/assessment/FM/FM21.jpg"),
    "FM22.jpg": require("../../../assets/assessment/FM/FM22.jpg"),
    "FM23.jpg": require("../../../assets/assessment/FM/FM23.jpg"),
    "FM24.jpg": require("../../../assets/assessment/FM/FM24.jpg"),
    "FM25.jpg": require("../../../assets/assessment/FM/FM25.jpg"),
    "FM26.jpg": require("../../../assets/assessment/FM/FM26.jpg"),
    "FM27.jpg": require("../../../assets/assessment/FM/FM27.jpg"),
    "FM28.jpg": require("../../../assets/assessment/FM/FM28.jpg"),
    "FM29.jpg": require("../../../assets/assessment/FM/FM29.jpg"),

    "RL1.jpg": require("../../../assets/assessment/RL/RL1.jpg"),
    "RL2.jpg": require("../../../assets/assessment/RL/RL2.jpg"),
    "RL3.jpg": require("../../../assets/assessment/RL/RL3.jpg"),
    "RL4.jpg": require("../../../assets/assessment/RL/RL4.jpg"),
    "RL5.jpg": require("../../../assets/assessment/RL/RL5.jpg"),
    "RL6.jpg": require("../../../assets/assessment/RL/RL6.jpg"),
    "RL7.jpg": require("../../../assets/assessment/RL/RL7.jpg"),
    "RL8.jpg": require("../../../assets/assessment/RL/RL8.jpg"),
    "RL9.jpg": require("../../../assets/assessment/RL/RL9.jpg"),
    "RL10.jpg": require("../../../assets/assessment/RL/RL10.jpg"),
    "RL11.jpg": require("../../../assets/assessment/RL/RL11.jpg"),
    "RL12.jpg": require("../../../assets/assessment/RL/RL12.jpg"),
    "RL13.jpg": require("../../../assets/assessment/RL/RL13.jpg"),
    "RL14.jpg": require("../../../assets/assessment/RL/RL14.jpg"),
    "RL15.jpg": require("../../../assets/assessment/RL/RL15.jpg"),
    "RL16.jpg": require("../../../assets/assessment/RL/RL16.jpg"),
    "RL17.jpg": require("../../../assets/assessment/RL/RL17.jpg"),
    "RL18.jpg": require("../../../assets/assessment/RL/RL18.jpg"),
    "RL19.jpg": require("../../../assets/assessment/RL/RL19.jpg"),
    "RL20.jpg": require("../../../assets/assessment/RL/RL20.jpg"),
    "RL21.jpg": require("../../../assets/assessment/RL/RL21.jpg"),
    "RL22.jpg": require("../../../assets/assessment/RL/RL22.jpg"),
    "RL23.jpg": require("../../../assets/assessment/RL/RL23.jpg"),
    "RL24.jpg": require("../../../assets/assessment/RL/RL24.jpg"),
    "RL25.jpg": require("../../../assets/assessment/RL/RL25.jpg"),
    "RL26.jpg": require("../../../assets/assessment/RL/RL26.jpg"),
    "RL27.jpg": require("../../../assets/assessment/RL/RL27.jpg"),
    "RL28.jpg": require("../../../assets/assessment/RL/RL28.jpg"),

    "EL1.jpg": require("../../../assets/assessment/EL/EL1.jpg"),
    "EL2.jpg": require("../../../assets/assessment/EL/EL2.jpg"),
    "EL3.jpg": require("../../../assets/assessment/EL/EL3.jpeg"),
    "EL4.jpg": require("../../../assets/assessment/EL/EL4.jpeg"),
    "EL5.jpg": require("../../../assets/assessment/EL/EL5.jpg"),
    "EL6.jpg": require("../../../assets/assessment/EL/EL6.jpg"),
    "EL7.jpg": require("../../../assets/assessment/EL/EL7.jpg"),
    "EL8.jpg": require("../../../assets/assessment/EL/EL8.jpg"),
    "EL9.jpg": require("../../../assets/assessment/EL/EL9.jpg"),
    "EL10.jpg": require("../../../assets/assessment/EL/EL10.jpg"),
    "EL11.jpg": require("../../../assets/assessment/EL/EL11.jpg"),
    "EL12.jpg": require("../../../assets/assessment/EL/EL12.jpg"),
    "EL13.jpg": require("../../../assets/assessment/EL/EL13.jpg"),
    "EL14.jpg": require("../../../assets/assessment/EL/EL14.jpg"),
    "EL15.jpg": require("../../../assets/assessment/EL/EL15.jpg"),
    "EL16.jpg": require("../../../assets/assessment/EL/EL16.jpg"),
    "EL17.jpg": require("../../../assets/assessment/EL/EL17.jpg"),
    "EL18.jpg": require("../../../assets/assessment/EL/EL18.jpg"),
    "EL19.jpg": require("../../../assets/assessment/EL/EL19.jpg"),
    "EL20.jpg": require("../../../assets/assessment/EL/EL20.jpg"),
    "EL21.jpg": require("../../../assets/assessment/EL/EL21.jpg"),
    "EL22.jpg": require("../../../assets/assessment/EL/EL22.jpg"),
    "EL23.jpg": require("../../../assets/assessment/EL/EL23.jpg"),
    "EL24.jpg": require("../../../assets/assessment/EL/EL24.jpg"),
    "EL25.jpg": require("../../../assets/assessment/EL/EL25.jpg"),
    "EL26.jpg": require("../../../assets/assessment/EL/EL26.jpg"),
    "EL27.jpg": require("../../../assets/assessment/EL/EL27.jpg"),

    "PS1.jpg": require("../../../assets/assessment/PS/PS1.jpg"),
    "PS2.jpg": require("../../../assets/assessment/PS/PS2.jpeg"),
    "PS3.jpeg": require("../../../assets/assessment/PS/PS3.jpeg"),
    "PS4.jpg": require("../../../assets/assessment/PS/PS4.jpg"),
    "PS5.jpg": require("../../../assets/assessment/PS/PS5.jpg"),
    "PS6.jpg": require("../../../assets/assessment/PS/PS6.jpg"),
    "PS7.jpg": require("../../../assets/assessment/PS/PS7.jpg"),
    "PS8.jpg": require("../../../assets/assessment/PS/PS8.jpg"),
    "PS9.jpg": require("../../../assets/assessment/PS/PS9.jpg"),
    "PS10.jpg": require("../../../assets/assessment/PS/PS10.jpg"),
    "PS11.jpg": require("../../../assets/assessment/PS/PS11.jpg"),
    "PS12.jpg": require("../../../assets/assessment/PS/PS12.jpg"),
    "PS13.jpg": require("../../../assets/assessment/PS/PS13.jpg"),
    "PS14.jpg": require("../../../assets/assessment/PS/PS14.jpg"),
    "PS15.jpg": require("../../../assets/assessment/PS/PS15.jpg"),
    "PS16.jpg": require("../../../assets/assessment/PS/PS16.jpg"),
    "PS17.jpg": require("../../../assets/assessment/PS/PS17.jpg"),
    "PS18.jpg": require("../../../assets/assessment/PS/PS18.jpg"),
    "PS19.jpg": require("../../../assets/assessment/PS/PS19.jpg"),
    "PS20.jpg": require("../../../assets/assessment/PS/PS20.jpg"),
    "PS21.jpg": require("../../../assets/assessment/PS/PS21.jpg"),
    "PS22.jpg": require("../../../assets/assessment/PS/PS22.jpg"),
    "PS23.jpg": require("../../../assets/assessment/PS/PS23.jpg"),
    "PS24.jpg": require("../../../assets/assessment/PS/PS24.jpg"),
    "PS25.jpg": require("../../../assets/assessment/PS/PS25.jpg"),
    "PS26.jpg": require("../../../assets/assessment/PS/PS26.jpg"),
    "PS27.jpg": require("../../../assets/assessment/PS/PS27.jpg"),

    "doll.png": require("../../../assets/assessment/Device/doll.png"),
    "squarehandkerchief.png": require("../../../assets/assessment/Device/squarehandkerchief.png"),
    "setB.png": require("../../../assets/assessment/Device/setB.png"),
    "setD.png": require("../../../assets/assessment/Device/setD.png"),
    "cup.png": require("../../../assets/assessment/Device/cup.png"),
    "setH.png": require("../../../assets/assessment/Device/setH.png"),
    "toothbrushtoothpaste.png": require("../../../assets/assessment/Device/toothbrushtoothpaste.png"),

    "setE.png": require("../../../assets/assessment/Device/setE.png"),
    "sanimalfoodclothes.jpg": require("../../../assets/assessment/Device/animalfoodclothes.jpg"),
    "chickenbutterflyflower.png": require("../../../assets/assessment/Device/ck_btf_flw.jpg"),
    "animalfoodclothes.jpg": require("../../../assets/assessment/Device/animalfoodclothes.jpg"),
    "card.png": require("../../../assets/assessment/Device/card.png"),
    "maracus.png": require("../../../assets/assessment/Device/maracus.png"),
    "setC.png": require("../../../assets/assessment/Device/setC.png"),
    "squarewooden.png": require("../../../assets/assessment/Device/squarewooden.png"),
    "storybook.png": require("../../../assets/assessment/Device/storybook.png"),
    "setK.png": require("../../../assets/assessment/Device/setK.png"),
    "setF.png": require("../../../assets/assessment/Device/setF.png"),
    "setG.png": require("../../../assets/assessment/Device/setG.png"),
    "squaretrianglecircle.png": require("../../../assets/assessment/Device/squaretrianglecircle.png"),
    "daynightpics.png": require("../../../assets/assessment/Device/daynightpics.jpg"),
    "nitannaisuan.JPG": require("../../../assets/assessment/Device/nitarnnaisuan.png"),
    "woodenandpaper.png": require("../../../assets/assessment/Device/woodenandpaper.png"),
    "redball.png": require("../../../assets/assessment/Device/redball.png"),
    "split3.png": require("../../../assets/assessment/Device/split3.png"),
    "circleonmiddle.png": require("../../../assets/assessment/Device/circleonmiddle.png"),
    "paperscissor.png": require("../../../assets/assessment/Device/paperscissor.png"),
    "split8.png": require("../../../assets/assessment/Device/split8.png"),
    "squareonmiddle.png": require("../../../assets/assessment/Device/squareonmiddle.png"),
    "scissorpaperline.png": require("../../../assets/assessment/Device/Scissorpaperline.png"),
    "triangleonmiddle.png": require("../../../assets/assessment/Device/triangleonmiddle.png"),
    "smallthing.png": require("../../../assets/assessment/Device/smallthing.png"),
    "setA.png": require("../../../assets/assessment/Device/setA.png"),
    "rope.png": require("../../../assets/assessment/Device/rope.png"),
    "ball.png": require("../../../assets/assessment/Device/ball.png"),
    "ropeonbox.png": require("../../../assets/assessment/Device/ropeonbox.png"),
    "setJ.png": require("../../../assets/assessment/Device/setJ.png"),
  };

  const getImageSource = (imagePath: string): any => {
    return imageMap[imagePath] || require("../../../assets/icons/banana.png");
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api update passed assessment
  const updatePassedAssessment = async (
    supervisor_assessment_id: number,
    assessment_id: number
  ) => {
    setModalVisibleNotPassed(false);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_ENDPOINT}/${API_UPDATE_PASSED}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supervisor_assessment_id, assessment_id }),
      });

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("อัปเดตผลการประเมินเรียบร้อย");
        navigation.navigate("listhistorypr", { child, aspect });
        console.log("Assessment status updated successfully");
      } else {
        console.error("Failed to update passed assessment:", response.status);
      }
    } catch (error) {
      console.error("Error updating passed assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api update not passed assessment
  const updateNotPassedAssessment = async (
    supervisor_assessment_id: number,
    assessment_id: number
  ) => {
    setModalVisibleNotPassed(false);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_ENDPOINT}/${API_UPDATE_NOT_PASSED}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supervisor_assessment_id, assessment_id }),
      });

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("อัปเดตผลการประเมินเรียบร้อย");
        navigation.navigate("listhistorypr", { child, aspect });
        console.log("Assessment status updated successfully");
      } else {
        console.error("Failed to update passed assessment:", response.status);
      }
    } catch (error) {
      console.error("Error updating passed assessment:", error);
    } finally {
      setLoading(false);
    }
  };
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // return
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../../assets/background/bg2.png")}
        style={styles.background}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <LinearGradient
              key={child.child_id}
              colors={
                child.gender === "male"
                  ? ["#fff", "#E7F6FF", "#D6ECFD"] // ไล่สีฟ้าสำหรับเด็กผู้ชาย
                  : ["#fff", "#FFDEE4", "#FFBED6"] // ไล่สีชมพูสำหรับเด็กผู้หญิง
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={
                child.gender === "male"
                  ? styles.profileCardBoy
                  : styles.profileCardGirl
              }
            >
              <Image
                source={{ uri: child.childPic }}
                style={styles.profileIcon}
              />
              <View style={styles.profileInfo}>
                <View style={styles.detailsName}>
                  <Text style={styles.profileName}>{child.nickName}</Text>
                </View>
                <View style={styles.detailsAge}>
                  <Text style={styles.profileAge}>{child.age}</Text>
                </View>
              </View>
            </LinearGradient>
            {/* History Assessment By aspect */}
            <TouchableOpacity
              style={{ width: "27%" }}
              onPress={() => setModalVisibleHistory(true)}
            >
              <LinearGradient
                colors={["#8DD9BD", "#CAEEE1"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 2 }}
                style={styles.historyAssessment}
              >
                <Image
                  source={require("../../../assets/icons/historyAssessment.png")}
                  style={styles.historyIcon}
                />
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {`ประวัติ\n`}การประเมิน
                </Text>
              </LinearGradient>
              {/* Popup Modal Choose Aspect */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibleHistory}
                onRequestClose={() => setModalVisibleHistory(false)}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>
                      {`เลือกด้านที่ต้องการประเมิน`}
                    </Text>
                    <View style={styles.modalButtonContainerHistory}>
                      {/* GM */}
                      <Pressable
                        style={styles.childDevHistory}
                        onPress={() => ListHistory(child, "GM")}
                      >
                        <Image
                          source={require("../../../assets/icons/GM.png")}
                          style={styles.childDevIconHistory}
                        />
                        <Text style={styles.childDevtextHistory}>
                          ด้านการเคลื่อนไหว (GM)
                        </Text>
                      </Pressable>
                      {/* FM */}
                      <Pressable
                        style={styles.childDevHistory}
                        onPress={() => ListHistory(child, "FM")}
                      >
                        <Image
                          source={require("../../../assets/icons/FM.png")}
                          style={styles.childDevIconHistory}
                        />
                        <Text style={styles.childDevtextHistory}>
                          {" "}
                          ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)
                        </Text>
                      </Pressable>
                      {/* RL */}
                      <Pressable
                        style={styles.childDevHistory}
                        onPress={() => ListHistory(child, "RL")}
                      >
                        <Image
                          source={require("../../../assets/icons/RL.png")}
                          style={styles.childDevIconHistory}
                        />
                        <Text style={styles.childDevtextHistory}>
                          ด้านการใช้ภาษา (RL)
                        </Text>
                      </Pressable>
                      {/* EL */}
                      <Pressable
                        style={styles.childDevHistory}
                        onPress={() => ListHistory(child, "EL")}
                      >
                        <Image
                          source={require("../../../assets/icons/EL.png")}
                          style={styles.childDevIconHistory}
                        />
                        <Text style={styles.childDevtextHistory}>
                          ด้านการเข้าใจภาษา (EL)
                        </Text>
                      </Pressable>
                      {/* PS */}
                      <Pressable
                        style={styles.childDevHistory}
                        onPress={() => ListHistory(child, "PS")}
                      >
                        <Image
                          source={require("../../../assets/icons/PS.png")}
                          style={styles.childDevIconHistory}
                        />
                        <Text style={styles.childDevtextHistory}>
                          ด้านการช่วยเหลือตัวเองและสังคม (PS)
                        </Text>
                      </Pressable>
                      {/* ปุ่มยกเลิก */}
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisibleHistory(false)}
                      >
                        <Text style={styles.buttonText}>ยกเลิก</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </TouchableOpacity>
          </View>

          {/* Mid Section */}
          <View style={styles.midSection}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 25 }}
            >
              <View style={styles.containerSection}>
                {loading ? (
                  <LoadingScreenBook />
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : assessment ? (
                  <>
                    {/* assessment header */}
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.headerText}>
                        ด้านการเคลื่อนไหว (GM)
                      </Text>
                      <Text style={styles.headerAgeContainer}>
                        อายุพัฒนาการ:{" "}
                        {assessment.details?.age_range
                          ? calculateAgeRange(
                              ...(assessment.details.age_range
                                .split("-")
                                .map(Number) as [number, number])
                            )
                          : "ข้อมูลไม่สมบูรณ์"}
                      </Text>
                    </View>

                    {/* assessment rank */}
                    <View style={styles.assessmentTop}>
                      <View style={styles.assessmentNumberContainer}>
                        <Text style={styles.assessmentNumber}>
                          {assessment.details?.assessment_details_id}
                        </Text>
                      </View>
                      <Text style={styles.assessmentTitle}>
                        {assessment.details?.assessment_name ?? "ไม่มีข้อมูล"}
                      </Text>
                    </View>

                    {assessment.details?.assessment_image && (
                      <Image
                        source={getImageSource(
                          assessment.details.assessment_image
                        )}
                        style={styles.assessmentLogo}
                      />
                    )}

                    {/* assessment device */}
                    {assessment.details &&
                      (assessment.details.assessment_device_name !== "none" ||
                        assessment.details.assessment_device_image !== "none" ||
                        assessment.details.assessment_device_detail !==
                          "none") &&
                      renderAssessmentDevice()}

                    {/* assessment how to */}
                    <View style={styles.assessmentHowto}>
                      <Text style={styles.headerHowto}>วิธีการประเมิน</Text>
                      <Text style={styles.howtoText}>
                        {assessment.details?.assessment_method ?? "ไม่มีข้อมูล"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.passAllAssessDetailcontainer}>
                    <View style={styles.headerPassAllTextContainer}>
                      <Text style={styles.headerPassAllText}>
                        ด้านการเคลื่อนไหว (GM)
                      </Text>
                    </View>
                    <Text style={styles.titlePassAllText}>
                      คุณได้ทำการประเมินในด้านนี้ครบทุกข้อแล้ว
                    </Text>
                    <LoadingScreenPassAll />
                    <Text style={styles.PassAllText}>
                      สามารถทำการประเมินในด้านอื่น ๆ ได้เลยค่ะ/ครับ
                    </Text>
                  </View>
                )}
              </View>

              {/* assessment result */}
              {loading ? (
                <></>
              ) : assessment.details ? (
                <View style={styles.assessmentResult}>
                  <View style={styles.headerResultContainer}>
                    <Text style={styles.headerResult}>ผลการประเมิน</Text>
                  </View>
                  <Text style={styles.resultText}>
                    {assessment.details?.assessment_succession ?? "ไม่มีข้อมูล"}
                  </Text>

                  <View style={styles.resultButtonCantainer}>
                    <Pressable
                      style={styles.yesButton}
                      onPress={() => setModalVisible(true)}
                    >
                      <Text>ได้</Text>
                    </Pressable>
                    <Pressable
                      style={styles.noButton}
                      onPress={() => setModalVisibleNotPassed(true)}
                    >
                      <Text>ไม่ได้</Text>
                    </Pressable>
                  </View>

                  {/* Popup Modal */}
                  {/* Popup Modal Passed */}
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <View style={styles.modalBackground}>
                      <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                          {`คุณต้องการยืนยันผลการประเมิน\n`}{" "}
                          <Text style={{ color: "green", fontWeight: "bold" }}>
                            ผ่าน
                          </Text>{" "}
                          ใช่หรือไม่?
                        </Text>
                        <Text style={styles.modaltitleText}>
                          หากยืนยันแล้วจะไม่สามารถแก้ไขได้อีก
                          โปรดตรวจสอบให้แน่ใจก่อนยืนยันทุกครั้ง
                        </Text>

                        <View style={styles.modalButtonContainer}>
                          {/* ปุ่มยืนยัน ผ่าน */}
                          <Pressable
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={() => {
                              if (assessment) {
                                updatePassedAssessment(
                                  assessment.supervisor_assessment_id,
                                  assessment.assessment_id
                                );
                              } else {
                                console.log("assessment  is null or undefined");
                              }
                            }}
                          >
                            <Text style={styles.buttonText}>ยืนยัน</Text>
                          </Pressable>
                          {/* ปุ่มยกเลิก */}
                          <Pressable
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}
                          >
                            <Text style={styles.buttonText}>ยกเลิก</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Modal>

                  {/* Popup Modal Not Passed */}
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisibleNotPassed}
                    onRequestClose={() => setModalVisibleNotPassed(false)}
                  >
                    <View style={styles.modalBackground}>
                      <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                          {`คุณต้องการยืนยันผลการประเมิน\n`}{" "}
                          <Text style={{ color: "red", fontWeight: "bold" }}>
                            ไม่ผ่าน
                          </Text>{" "}
                          ใช่หรือไม่?
                        </Text>
                        <Text style={styles.modaltitleText}>
                          หากยืนยันแล้วจะไม่สามารถแก้ไขได้อีก
                          โปรดตรวจสอบให้แน่ใจก่อนยืนยันทุกครั้ง
                        </Text>

                        <View style={styles.modalButtonContainer}>
                          {/* ปุ่มยืนยัน ไม่ผ่าน */}
                          <Pressable
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={() => {
                              if (assessment) {
                                updateNotPassedAssessment(
                                  assessment.supervisor_assessment_id,
                                  assessment.assessment_id
                                );
                              } else {
                                console.log("assessment  is null or undefined");
                              }
                            }}
                          >
                            <Text style={styles.buttonText}>ยืนยัน</Text>
                          </Pressable>
                          {/* ปุ่มยกเลิก */}
                          <Pressable
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setModalVisibleNotPassed(false)}
                          >
                            <Text style={styles.buttonText}>ยกเลิก</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              ) : (
                <></>
              )}
            </ScrollView>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.backButton}
                onPress={() => whenGotoAssessment(child, aspect)}
              >
                <Image
                  source={require("../../../assets/icons/back.png")}
                  style={styles.backIcon}
                />
              </Pressable>
              <Pressable style={styles.sucessButton} onPress={whenGotoHomeSP}>
                <Text style={styles.sucessText}>เสร็จสิ้น</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    paddingTop: "9%",
    // borderWidth: 2,
  },
  topSection: {
    flexDirection: "row",
    width: "100%",
    height: "12%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    // marginTop: "5%",
    // borderWidth: 2,
  },
  midSection: {
    width: "100%",
    height: "77%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "center",
    // borderWidth: 2,
  },
  containerSection: {
    // flexGrow: 1,
    width: "100%",
    height: "auto",
    minHeight: 300,
    marginTop: 5,
    paddingBottom: 10,
    borderRadius: 20,
    shadowColor: "#c5c5c5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#fff",
    alignItems: "center",
    overflow: "hidden", // Add this line to prevent overflow
    // borderWidth: 2,
  },
  bottomSection: {
    flexDirection: "row",
    width: "100%",
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  profileCardGirl: {
    flexDirection: "row",
    height: "auto",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 20,
    width: "70%",
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  profileCardBoy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 20,
    width: "70%",
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  profileIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
  detailsButtonGirl: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#FFA2C4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsName: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
  },
  backIcon: {
    width: 35,
    height: 35,
  },
  childDev: {
    flexDirection: "row",
    width: "90%",
    paddingVertical: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  childDevIcon: {
    width: 45,
    height: 45,
    right: 15,
  },
  childDevtext: {
    fontSize: 18,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  headerTextContainer: {
    // flexGrow: 1,
    width: "100%",
    // height: "15%",
    borderRadius: 0,
    backgroundColor: "#5F5F5F",
    alignItems: "center",
    marginBottom: 10,
    // borderWidth: 2,
  },
  headerText: {
    fontSize: 18,
    maxWidth: "80%",
    color: "#fff",
    fontWeight: "bold",
    top: 6,
    textAlign: "center",
    // borderWidth: 2,
  },
  headerAgeContainer: {
    // fontSize: 12,
    width: "auto",
    // height: 30,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    padding: 4,
    marginVertical: 10, // ระยะห่างข้างล่าง
    textAlign: "center",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DFF2EA",
    borderRadius: 25,
    marginBottom: 10,
    width: "90%",
    height: 50,
  },
  assessmentNumberContainer: {
    backgroundColor: "#8DD9BD",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 30,
    width: 60,
    height: "100%",
  },
  assessmentNumber: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold",
  },
  assessmentTitleContainer: {
    flexDirection: "row",
    width: "70%",
    height: "auto",
    alignItems: "center",
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    width: "70%",
    height: "auto",
    marginTop: 5,
    marginBottom: 5,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentLogo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 15,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentDevice: {
    width: "90%",
    // paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  deviceText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deviceIcon: {
    width: "70%",
    height: 70,
    // borderWidth: 1,
  },
  deviceDetail: {
    fontSize: 12,
    color: "#555",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentHowto: {
    width: "90%",
    height: "auto",
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  headerHowto: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    //borderWidth: 2,
  },
  howtoText: {
    fontSize: 13,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentResult: {
    // flex: 1,
    width: "100%",
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#c5c5c5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  headerResultContainer: {
    width: "100%",
    height: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: "#5F5F5F",
    justifyContent: "center",
  },

  headerResult: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  resultText: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  resultButtonCantainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-around",
    //marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    //borderWidth: 2,
  },
  yesButton: {
    backgroundColor: "#9de3c9",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#FF9E9E",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },

  //passAll
  headerPassAllTextContainer: {
    width: "100%",
    height: 50,
    borderRadius: 0,
    backgroundColor: "#5F5F5F",
    alignItems: "center", // แกน x
    justifyContent: "center", // แกน y
  },

  headerPassAllText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  titlePassAllText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  PassAllText: {
    bottom: 10,
    fontSize: 14,
    //fontWeight: "bold",
    textAlign: "center",
  },

  passAllAssessDetailcontainer: {
    alignContent: "center",
    width: "100%",
    height: "auto",
    backgroundColor: "white",
    //borderWidth: 1,
  },
  passAllResultcontainer: {
    marginTop: 10,
    width: "100%",
    height: "20%",
    backgroundColor: "white",
    //borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  buttonContainer: {
    flexDirection: "row",
    width: "80%",
    height: 85,
    alignItems: "center",
    justifyContent: "space-between",
    // borderWidth: 2,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "35%",
    height: "60%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  sucessButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "60%",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  sucessText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  errorText: {
    color: "red",
    fontSize: 16,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
  },
  modalContainer: {
    width: 350,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  modaltitleText: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  modalButton: {
    flexGrow: 1,
    width: "40%",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginHorizontal: 5,
    // borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: "#FFB6B6",
    marginTop: 5,
  },
  confirmButton: {
    backgroundColor: "#CAEEE1",
  },
  confirmButtonCalender: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonCalender: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  historyAssessment: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  historyIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
    resizeMode: "contain",
  },
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  modalButtonContainerHistory: {
    // flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  childDevHistory: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 15,
    marginVertical: 6,
    // shadowColor: "#b5b5b5",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    // elevation: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  childDevIconHistory: {
    width: 45,
    height: 45,
    right: 10,
  },
  childDevtextHistory: {
    fontSize: 16,
    maxWidth: "64%",
    textAlign: "center",
  },
});
