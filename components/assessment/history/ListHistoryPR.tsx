// Assessment.tsx
import React, { FC, useState, useCallback } from "react";
import {
  ImageBackground,
  View,
  StyleSheet,
  Pressable,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LoadingScreenBaby } from "../../LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import child value
import { Child } from "../../page/SP/HomeSP";
import { AssessmentDetails } from "./AssessmentRetrySP";
type ChildRouteProp = RouteProp<
  {
    assessmentRetry: {
      child: Child;
      aspect: string;
      assessments: AssessmentDetails;
    };
  },
  "assessmentRetry"
>;

// Define API URL
import { API_ASSESSMENT_HISTORY, API_ENDPOINT } from "@env";

export const ListHistoryPR: FC = () => {
  // useState
  const navigation = useNavigation<NavigationProp<any>>();
  const Childroute = useRoute<ChildRouteProp>();
  const { child } = Childroute.params;
  const { aspect } = Childroute.params;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [assessments, setAssessments] = useState<any[]>([]);

  // ============================================================================================
  // useEffect
  const fetchChildDataAssessmentHistory = useCallback(async () => {
    let isActive = true;
    try {
      setLoading(true);

      const parent_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      if (!child?.child_id) {
        console.warn("Child ID is missing.");
        setLoading(false);
        return;
      }

      if (!parent_id) {
        console.error("parent ID is missing.");
        setLoading(false);
        return;
      }

      if (!token) {
        console.error("Authentication token is missing.");
        setLoading(false);
        return;
      }

      console.log("Fetching data for Child ID:", child.child_id);
      console.log("Parent ID:", parent_id);

      const response = await fetch(
        `${API_ENDPOINT}/${API_ASSESSMENT_HISTORY}/${child.child_id}/${aspect}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ parent_id }),
        }
      );

      if (!response.ok) {
        console.error(
          `Error fetching data: ${response.status} ${response.statusText}`
        );
        setLoading(false);
        return;
      }

      const jsonResponse = await response.json();
      const childData = jsonResponse?.child || {};
      const assessmentData = childData?.assessments || [];

      if (isActive) {
        setAssessments(assessmentData);
        console.log("Assessment Data:", assessmentData);
      }
    } catch (error) {
      console.error("Error fetching Assessment History data:", error);
    } finally {
      if (isActive) setLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [child?.child_id, aspect]);

  useFocusEffect(
    useCallback(() => {
      fetchChildDataAssessmentHistory();
    }, [fetchChildDataAssessmentHistory])
  );

  const formatDate = (dateString: string): string => {
    if (!dateString) return "ไม่ระบุวันที่";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "วันที่ไม่ถูกต้อง"; // ตรวจสอบว่าค่าเป็นวันที่ถูกต้องหรือไม่

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // เดือนเริ่มจาก 0 จึงต้อง +1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return "ไม่ระบุเวลา";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "เวลาที่ไม่ถูกต้อง";

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}.${minutes} น.`;
  };

  // ตัวอย่างการใช้งาน
  // console.log(formatDate("2024-02-25"));
  // console.log(formatTime("2025-03-26T12:33:30.000Z"));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChildDataAssessmentHistory();
    setRefreshing(false);
  };

  // if (loading) {
  //   return <LoadingScreenBaby />;
  // }
  // ============================================================================================

  // navigate
  const whenGotoEditChild = (child: Child) => {
    navigation.navigate("editchildpr", { child });
  };

  const whenGotoHome = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  // whenGotoAssessment
  const whenGotoAssessment = (child: Child, aspect: string) => {
    navigation.navigate("assessmentpr", { child, aspect });
  };

  const whenGotoRetryAssessment = (
    child: Child,
    aspect: string,
    assessment: AssessmentDetails
  ) => {
    navigation.navigate("assessmentretrypr", { child, aspect, assessment });
  };

  // ============================================================================================
  const getAssessmentsByAspectHistory = (aspect: string) => {
    return assessments
      .filter((a) => a.details?.aspect === aspect)
      .sort(
        (a, b) =>
          new Date(b.assessment_date).getTime() -
          new Date(a.assessment_date).getTime()
      );
  };

  const assessmentsByAspect = getAssessmentsByAspectHistory(aspect);

  const aspectLabels: { [key: string]: string } = {
    GM: "ด้านการเคลื่อนไหว (GM)",
    FM: "ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)",
    RL: "ด้านการใช้ภาษา (RL)",
    EL: "ด้านการเข้าใจภาษา (EL)",
    PS: "ด้านการช่วยเหลือตัวเองและสังคม (PS)",
  };

  // ============================================================================================

  return (
    <ImageBackground
      source={require("../../../assets/background/bg2.png")}
      style={styles.background}
    >
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
          <Image source={{ uri: child.childPic }} style={styles.profileIcon} />
          <View style={styles.profileInfo}>
            <View style={styles.detailsName}>
              <Text style={styles.profileName}>{child.nickName}</Text>
            </View>
            <View style={styles.detailsAge}>
              <Text style={styles.profileAge}>{child.age}</Text>
            </View>
            <Pressable
              key={child.child_id}
              style={
                child.gender === "male"
                  ? styles.detailsButtonBoy
                  : styles.detailsButtonGirl
              }
              onPress={() => whenGotoEditChild(child)}
            >
              <Text style={styles.detailsText}>แก้ไขข้อมูล</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* Mid Section */}
      <View style={styles.midSection}>
        <LinearGradient
          colors={["#8DD9BD", "#CAEEE1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 2 }}
          style={styles.headerTitleOfMidSection}
        >
          <Text style={styles.headerText}>
            {aspectLabels[aspect] || "ไม่ระบุด้านการประเมิน"}
          </Text>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {assessmentsByAspect.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: "#888", fontSize: 16 }}>
                ยังไม่มีการประเมินในด้านนี้
              </Text>
            </View>
          ) : (
            getAssessmentsByAspectHistory(aspect).map((assessment, index) => (
              <LinearGradient
                key={index}
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <View style={styles.DateNoContainer}>
                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {assessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>วันที่</Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(assessment.assessment_date)}
                        </Text>
                      </View>
                    </View>
                    {/* เวลา */}
                    <View style={styles.TimeContainer}>
                      <View style={styles.TimeHeader}>
                        <Text style={styles.TimeHeaderText}>เวลา</Text>
                      </View>
                      <View style={styles.TimeTextContainer}>
                        <Text style={styles.TimeText}>
                          {formatTime(assessment.assessment_date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>อายุพัฒนาการ</Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {assessment.details?.age_range ?? "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>

                  {/* ผลการประเมิน */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>ผลการประเมิน</Text>
                    </View>
                    <View style={styles.DevStatusTextContainer}>
                      <Text style={styles.DevStatusText}>
                        {assessment.status === "passed"
                          ? "ผ่าน"
                          : assessment.status === "in_progress"
                          ? "กำลังประเมิน"
                          : assessment.status === "not_passed"
                          ? "ไม่ผ่าน"
                          : "-"}
                      </Text>
                    </View>
                  </View>

                  {/* Retry */}
                  <TouchableOpacity
                    style={styles.DevRetryContainer}
                    onPress={() =>
                      whenGotoRetryAssessment(child, aspect, assessment)
                    }
                  >
                    <View style={styles.DevRetryHeader}>
                      <Image
                        source={require("../../../assets/icons/retry.png")}
                        style={styles.DevRetryIcon}
                      />
                      <Text style={styles.DevRetryHeaderText}>
                        ประเมินใหม่อีกครั้ง
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ))
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
              style={styles.Icon}
            />
          </Pressable>
          <Pressable onPress={whenGotoHome} style={styles.homeButton}>
            <Image
              source={require("../../../assets/icons/home.png")}
              style={styles.Icon}
            />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  topSection: {
    // flex: 1,
    width: "100%",
    // height: "19%",
    paddingTop: "12%",
    alignItems: "center",
    // borderWidth: 2,
  },
  midSection: {
    flex: 1,
    width: "95%",
    height: "60%",
    alignSelf: "center",
    // alignItems: "center",
    marginTop: 10,
    // borderWidth: 2,
  },
  detailByAssess: {
    flexDirection: "column",
    width: "95%",
    height: "auto",
    marginHorizontal: 10,
    marginBottom: 10,
    //borderWidth: 1,
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  HeaderOfAssessment: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: "#8DD9BD",
    justifyContent: "center",
    alignItems: "center",
  },
  HeaderOfAssessmentText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  BodyOfAssesment: {
    alignItems: "center",
    flexDirection: "column",
    width: "95%",
    // borderWidth: 1,
  },
  DateNoContainer: {
    // alignItems: "center",
    // justifyContent: "center",
    flexDirection: "row",
    width: "100%",
    height: 35,
    paddingLeft: 10,
    // borderWidth: 1,
  },
  DateContainer: {
    flexDirection: "row",
    width: "40%",
    borderRadius: 8,
    marginRight: 10,
    // marginLeft: 10,
  },
  DateHeader: {
    flexDirection: "row",
    //borderWidth:1,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    backgroundColor: "#CAEEE1",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 12,
  },
  DateHeaderText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
    //fontWeight:"bold",
  },
  DateTextContainer: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  DateText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
  },

  TimeContainer: {
    flexDirection: "row",
    width: "45%",
    borderRadius: 8,
    // marginLeft: 4,
    // borderWidth:1,
  },
  TimeHeader: {
    //flexDirection:"row",
    //borderWidth:1,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    backgroundColor: "#CAEEE1",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 12,
  },
  TimeHeaderText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
    //fontWeight:"bold",
  },
  TimeTextContainer: {
    backgroundColor: "#fff",
    width: "40%",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  TimeText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
  },

  NoHeaderContainer: {
    flexDirection: "row",
    //backgroundColor:"#fff",
    width: "20%",
    borderRadius: 8,
    marginRight: 10,
    // marginLeft: 4,
  },
  NoHeader: {
    //borderWidth:1,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    backgroundColor: "#CAEEE1",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 12,
  },
  NoHeaderText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
    //fontWeight:"bold",
  },
  NoContainer: {
    flexDirection: "row",
    width: "60%",
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  NoText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
  },

  DevAgeContainer: {
    flexDirection: "row",
    //borderWidth:1,
    width: "98%",
    height: 35,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    //backgroundColor:"#fff",
  },

  DevAgeHeader: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    backgroundColor: "#CAEEE1",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 12,
  },
  DevAgeHeaderText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 7,
    //fontWeight:"bold",
  },
  DevAgeTextContainer: {
    flexDirection: "row",
    width: "60%",
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  DevAgeText: {
    color: "#000",
    textAlign: "right",
    width: "50%",
    paddingVertical: 5,
    marginRight: 10,
  },
  monthText: {
    color: "#000",
    textAlign: "left",
    width: "50%",
    paddingVertical: 5,
    //borderWidth:1,
  },
  DevStatusTextContainer: {
    flexDirection: "row",
    width: "60%",
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  DevStatusText: {
    color: "#000",
    textAlign: "center",
    width: "100%",
    paddingVertical: 5,
  },

  // Retry Assessment
  DevRetryContainer: {
    // flexDirection: "row",
    // borderWidth: 1,
    width: "98%",
    height: 35,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    //backgroundColor:"#fff",
  },
  DevRetryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 90,
    backgroundColor: "#8DD9BD",
    borderRadius: 50,
    // borderWidth: 1,
  },
  DevRetryHeaderText: {
    color: "#000",
    textAlign: "center",
    // width: "100%",
    paddingVertical: 7,
    // borderWidth: 1,
    //fontWeight:"bold",
  },
  DevRetryTextContainer: {
    flexDirection: "row",
    width: "60%",
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
    justifyContent: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
  },
  DevRetryText: {
    color: "#000",
    textAlign: "right",
    width: "50%",
    paddingVertical: 5,
    marginRight: 10,
  },
  DevRetryIcon: {
    width: 20,
    height: 20,
    // borderWidth: 1,
  },

  profileCardGirl: {
    flexDirection: "row",
    width: 350,
    height: 130,
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    //borderWidth:2,
  },
  profileCardBoy: {
    flexDirection: "row",
    width: 350,
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    // marginTop: "5%",
    //borderWidth:2,
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
    shadowColor: "#ff7aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 9,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
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
    marginTop: 5,
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

  // Bottom
  bottomSection: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 20,
    paddingBottom: 20,
    // justifyContent: "center",
    alignItems: "center",
    // borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 25,
    width: "100%",
    alignItems: "center",
    // borderWidth: 2,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "40%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  homeButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "40%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  Icon: {
    width: 30,
    height: 30,
  },

  // ============================================================================================
  headerTitleOfMidSection: {
    width: "auto",
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A3A3A",
    textAlign: "center",
  },
});
