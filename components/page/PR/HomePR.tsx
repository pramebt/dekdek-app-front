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
} from "../../../app/usePushNotifications";

import { LoadingScreenBaby } from "../../LoadingScreen";
import LottieView from "lottie-react-native";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// กำหนด interface สำหรับข้อมูลเด็ก
export interface Child {
  child_id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
  assessments: AssessmentDetails[];
}

export interface AssessmentDetails {
  assessment_details_id: number;
  aspect: string;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_succession: string;
  assessmentInsert_id: number;
  child_id: number;
  status: string;
}

interface HomePRProps {
  setNotificationCount: (count: number) => void;
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// fn calculate age
export const calculateAge = (
  birthday: string
): { years: number; months: number } => {
  const birthDate = new Date(birthday); // แปลง birthday เป็น Date
  const today = new Date(); // วันที่ปัจจุบัน

  let years = today.getFullYear() - birthDate.getFullYear(); // คำนวณอายุในปี
  let months = today.getMonth() - birthDate.getMonth(); // คำนวณเดือน

  // ตรวจสอบเดือน
  if (months < 0) {
    years--; // ลดอายุลง 1 ปีถ้าปีนี้ยังไม่ถึงวันเกิด
    months += 12; // ปรับให้เดือนเป็นค่าบวก
  }

  // ตรวจสอบวัน
  if (today.getDate() < birthDate.getDate() && months > 0) {
    months--; // ลดเดือนลง 1 เดือนถ้ายังไม่ถึงวันเกิดในเดือนนี้
  }

  return { years, months }; // ส่งคืนปีและเดือน
};

// Define API URL
import {
  API_ENDPOINT,
  API_GET_CHILD,
  API_GET_NOTIFICATE,
  API_MIDDLEWARE_REFRESH_TOKEN,
} from "@env";

export const HomePR: React.FC<HomePRProps> = ({ setNotificationCount }) => {
  // useState
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]);
  const [assessmentDetails, setAssessmentDetails] = useState<
    AssessmentDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { expoPushToken } = usePushNotifications();

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("❌ ไม่มี Refresh Token ใน AsyncStorage");
        return null;
      }

      const response = await fetch(
        `${API_ENDPOINT}/${API_MIDDLEWARE_REFRESH_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-refresh-token": refreshToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("userToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken); // ✅ อัปเดต Refresh Token ใหม่
        console.log("✅ Access Token & Refresh Token อัปเดตเรียบร้อย");
        return data.accessToken;
      } else {
        console.error("❌ ไม่สามารถขอ Access Token ใหม่ได้");
        return null;
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการขอ Token ใหม่:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNotificationCount = async () => {
      const user_id = await AsyncStorage.getItem("userId");
      let token = await AsyncStorage.getItem("userToken");
      let refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!user_id) return;

      let response = await fetch(
        `${API_ENDPOINT}/${API_GET_NOTIFICATE}?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken ?? "",
          },
        }
      );

      // 🔄 ถ้า Access Token หมดอายุ ให้ลองใช้ Refresh Token
      if (response.status === 403 || response.status === 401) {
        console.log("🔄 Access Token หมดอายุ กำลังขอใหม่...");
        token = await refreshAccessToken();

        if (!token) {
          console.log("❌ Refresh Token หมดอายุ ผู้ใช้ต้องล็อกอินใหม่");
          return;
        }

        // ✅ ลองเรียก API อีกครั้งด้วย Access Token ใหม่ และแนบ Refresh Token
        response = await fetch(
          `${API_ENDPOINT}/${API_GET_NOTIFICATE}?user_id=${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-refresh-token": refreshToken ?? "",
            },
          }
        );
      }

      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.notifications.filter(
          (n: { status: string }) => n.status === "unread"
        ).length;
        setNotificationCount(unreadCount);
      }
    };

    fetchNotificationCount(); // ดึงข้อมูลครั้งแรก

    const interval = setInterval(fetchNotificationCount, 30000); // เช็คทุก 30 วินาที

    return () => clearInterval(interval); // เคลียร์ Interval เมื่อ Component Unmount
  }, []);

  // useEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildDataForParent = async () => {
        try {
          const parent_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          let refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!parent_id) {
            console.error("Parent ID is missing.");
            return;
          }

          if (!token) {
            console.error("token is missing.");
            return;
          }

          if (expoPushToken) {
            const user_id = parseInt(parent_id, 10);
            if (!isNaN(user_id)) {
              await sendExpoPushTokenToBackend(expoPushToken, user_id);
            } else {
              console.error("Invalid user ID.");
            }
          }

          setLoading(true);
          const response = await fetch(
            `${API_ENDPOINT}/${API_GET_CHILD}?parent_id=${parent_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-refresh-token": refreshToken ?? "",
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();
            console.log("Fetch child data successfully");

            if (jsonResponse.children) {
              const updatedChildren: Child[] = jsonResponse.children.map(
                (child: Child) => {
                  const { years, months } = calculateAge(child.birthday);
                  const imageUrl = `${API_ENDPOINT}/${child.childPic}`;
                  return {
                    ...child,
                    age: `${years} ปี ${months} เดือน`,
                    childPic: imageUrl,
                  };
                }
              );

              setTimeout(() => {
                setChildren(updatedChildren);
                setLoading(false);
              }, 100); // set delay

              const allAssessments = jsonResponse.children.map(
                (child: any) => child.assessments || []
              );
              setAssessmentDetails(allAssessments.flat());
            } else {
              console.log("No children found.");
              setChildren([]);
              setAssessmentDetails([]);
              setLoading(false);
            }
          } else {
            console.error(
              `Error fetching data: ${response.status} ${response.statusText}`
            );
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching child data:", error);
          setLoading(false);
        }
      };

      fetchChildDataForParent();
    }, [expoPushToken])
  );

  // === ( LoadingScreen ) ===
  if (loading) {
    return <LoadingScreenBaby />;
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentState

  const renderAssessmentState = (childId: number) => {
    if (!assessmentDetails) {
      console.log("assessmentDetails is null or undefined");
      return null;
    }

    const childAssessmentDetails = children
      .filter((child) => child.child_id === childId)
      .flatMap((child) =>
        child.assessments.filter((detail) => detail.aspect !== "none")
      );

    if (childAssessmentDetails.length === 0) {
      return null;
    }

    return (
      <View style={styles.stateContainer}>
        {["GM", "FM", "RL", "EL", "PS"].map((aspect) => {
          const filteredDetails = childAssessmentDetails.filter(
            (detail) => detail.aspect === aspect && detail.aspect !== "none"
          );

          if (filteredDetails.length === 0) return null;

          return (
            <View key={aspect}>
              {filteredDetails.map((detail) => (
                <View
                  key={detail.assessment_details_id}
                  style={styles.assessmentsState}
                >
                  <View style={styles.aspectName}>
                    <Text style={styles.textaspectName}>{detail.aspect}</Text>
                  </View>

                  <View style={styles.stateNumber}>
                    {detail.status === "passed_all" ? (
                      <LottieView
                        source={require("../../../assets/logo/lottie/checkmark.json")}
                        style={styles.checkmarkIcon}
                        autoPlay={true}
                      />
                    ) : (
                      <Text style={styles.textState}>
                        {detail.assessment_details_id}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate

  const whenGotoAddChild = () => {
    navigation.navigate("addchild");
  };

  const whenGotoDetail = (child: Child, assessment: AssessmentDetails[]) => {
    navigation.navigate("childdetail", { child, assessment });
  };

  const whenGotoAssessment = (child: Child) => {
    navigation.navigate("aspectpr", { child });
  };

  const whenGotoChooseChild = () => {
    navigation.navigate("choosechild");
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
          <View style={styles.container}>
            {/* start assessments Section */}
            <View style={styles.startassessmentsSection}>
              <TouchableOpacity onPress={whenGotoChooseChild}>
                <LinearGradient
                  colors={["#FFFFFF", "#c7eedb"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1.5 }}
                  style={styles.evaluateButton}
                >
                  <Image
                    source={require("../../../assets/icons/self-improvement_1.png")}
                    style={styles.asessmentIcon}
                  />
                  <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={whenGotoAddChild}>
                <LinearGradient
                  colors={["#CEC9FF", "#F5E5FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 2 }}
                  style={styles.addchildButton}
                >
                  <Image
                    source={require("../../../assets/icons/addchild.png")}
                    style={styles.addchildIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Child data Section */}
            <View style={styles.midSection}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.ScrollView}
              >
                {children.length === 0 ? (
                  <View style={styles.howtousesection}>
                    <Image
                      source={require("../../../assets/images/howtouse.png")}
                      style={styles.howtouseImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  children.map((child) => (
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
                      <View style={styles.profileCard}>
                        <TouchableOpacity
                          onPress={() => whenGotoAssessment(child)}
                        >
                          <View style={styles.profileInfo}>
                            <Image
                              source={
                                child.childPic
                                  ? { uri: child.childPic }
                                  : require("../../../assets/icons/User_Icon.png")
                              }
                              style={styles.profileIcon}
                            />

                            <View style={styles.childInfo}>
                              <View style={styles.detailsName}>
                                <Text style={styles.profileName}>
                                  {child.nickName}
                                </Text>
                              </View>
                              <View style={styles.detailsAge}>
                                <Text style={styles.profileAge}>
                                  {child.age}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* render assessmentsState */}
                          {renderAssessmentState(child.child_id)}
                        </TouchableOpacity>

                        {/* WhenGoto ChildDetails */}
                        <TouchableOpacity
                          key={child.child_id}
                          style={
                            child.gender === "male"
                              ? styles.detailsButtonBoy
                              : styles.detailsButtonGirl
                          }
                          onPress={() =>
                            whenGotoDetail(
                              child,
                              assessmentDetails.filter(
                                (a) => a.child_id === child.child_id
                              )
                            )
                          }
                        >
                          <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: "5%",
    alignItems: "center",
    // justifyContent: "center",
  },
  background: {
    flex: 1,
    // resizeMode: "cover",
    // height: 850,
    height: "100%",
    // borderWidth: 2,
  },
  ScrollView: {
    width: "100%",
    //borderWidth: 2,
    borderRadius: 30,
  },
  addchildButton: {
    marginTop: 15, // เพิ่มระยะห่างจากปุ่ม Start Assessment
    width: 350,
    paddingVertical: 7,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#646464",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    //borderWidth:2,
  },
  addchildIcon: {
    width: 20,
    height: 30,
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },

  // ---------------------------------------------------------------------------------------------

  midSection: {
    width: "90%",
    height: "65.5%",
    //marginTop: 5,
    marginBottom: 15,
    flexDirection: "row",
    //alignItems: "center",
    justifyContent: "center",
    //borderWidth: 2,
  },
  profileCardBoy: {
    flexDirection: "row",
    // alignItems: "center",
    //backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    width: 350,
    height: "auto",
    marginTop: 5,
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  profileCardGirl: {
    flexDirection: "row",
    // alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    width: 350,
    height: "auto",
    marginTop: 5,
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },

  profileIcon: {
    width: 64,
    height: 64,
    marginTop: 5,
    // marginVertical:5,
    borderRadius: 50,
    marginLeft: 10,
    //marginHorizontal:10,
  },
  profileInfo: {
    flexDirection: "row",
    // borderWidth: 2,
  },
  profileCard: {
    flex: 1,
  },
  childInfo: {
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
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 10,
    //marginTop: 9,
    backgroundColor: "#FFA2C4",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#ff7aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  detailsButtonBoy: {
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 10,
    //marginTop: 9,
    backgroundColor: "#98D4FF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#76c6ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  detailsName: {
    width: "90%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: "center", // จัดแนวตัวอักษรในแนวแกน X ให้อยู่ตรงกลาง
    justifyContent: "center", // จัดแนวตัวอักษรในแนวแกน Y ให้อยู่ตรงกลาง
    //borderWidth:2,
  },
  detailsAge: {
    width: "90%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
  },

  // ----------------------------------------------------------------------------------

  stateContainer: {
    flexDirection: "row",
    flex: 2,
    //justifyContent: "space-evenly", // กระจายกล่องให้มีระยะห่างเท่ากัน รวมขอบซ้าย-ขวา
    alignItems: "center",
    width: "100%",
    height: "40%",
    //borderWidth: 1,
    paddingHorizontal: 10, // เพิ่ม padding ซ้าย-ขวาให้บาลานซ์ขึ้น
  },

  assessmentsState: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: "auto",
    borderRadius: 15,
    marginTop: 10,
    //borderWidth: 1,
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginLeft: 1.5,
  },

  textState: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },

  aspectName: {
    textAlign: "center",
    width: 55,
    height: 28,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#8DD9BD",
    justifyContent: "center",
    alignItems: "center", // ให้ text อยู่กึ่งกลาง
  },

  textaspectName: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },

  stateNumber: {
    width: 55,
    height: 30,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center", // ให้ text อยู่กึ่งกลาง
  },

  // ---------------------------------------------------------------------------------------------

  startassessmentsSection: {
    alignItems: "center",
    width: "85%",
    height: "auto",
    marginTop: 15,
    marginBottom: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 5 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // elevation: 4,
  },
  evaluateButton: {
    backgroundColor: "#ccfff5",
    flexDirection: "row",
    width: "100%",
    height: 110,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9b9b9b",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
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
  // ---------------------------------------------------------------------------------------------

  howtousesection: {
    alignItems: "center",
    width: "100%",
    height: "auto",
    // borderWidth: 2,
  },
  howtouseImage: {
    width: "100%",
    height: 950,
  },
  assessmentTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginBottom: 10,
  },
  assessmentNumberContainer: {
    backgroundColor: "#FFD2DC",
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    width: 65,
    height: "100%",
    alignItems: "center",
  },
  assessmentNumber: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold",
  },
  assessmentTitleContainer: {
    flexDirection: "row",
    width: "85%",
    alignItems: "center",
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 40,
  },
  assessmentImage: {
    width: "50%",
    height: "30%",
    marginBottom: 15,
  },
  skillContainer: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    height: "52%",
  },
  skillHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    left: 100,
    right: 100,
  },
  skillText: {
    fontSize: 14,
    color: "#555",
  },

  // ----------------------------------------------------------------------------------
  profileCardIntro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 280,
    height: 130,
    marginLeft: 10,
  },
  IntroContainer: {
    width: "90%",
    marginLeft: 4,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 13,
    marginTop: 9,
    backgroundColor: "#ececec",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailTextIntro: {
    fontSize: 14,
    color: "#000",
    padding: 2,
  },
  TextIntro: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkmarkIcon: {
    width: 24,
    height: 24,
  },
});
