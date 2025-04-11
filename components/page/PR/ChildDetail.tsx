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
  SafeAreaView,
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
import { Child } from "../PR/HomePR";
type ChildRouteProp = RouteProp<{ assessment: { child: Child } }, "assessment">;

// Define API URL
import { API_ASSESSMENT_CHILD, API_ENDPOINT } from "@env";

export const ChildDetail: FC = () => {
  // useState
  const navigation = useNavigation<NavigationProp<any>>();
  const Childroute = useRoute<ChildRouteProp>();
  const { child } = Childroute.params;

  const [loading, setLoading] = useState<boolean>(true);
  const [assessments, setAssessments] = useState<any[]>([]); //

  // ============================================================================================
  // useEffect
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchChildDataForParent = async () => {
        try {
          setLoading(true); // Set loading to true before fetching data

          const parent_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!child?.child_id) {
            console.warn("Child ID is missing.");
            setLoading(false);
            return;
          }

          if (!parent_id) {
            console.error("Parent ID is missing.");
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
            `${API_ENDPOINT}/${API_ASSESSMENT_CHILD}/${parent_id}/${child.child_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
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
          }
        } catch (error) {
          console.error("Error fetching child data:", error);
        } finally {
          if (isActive) setLoading(false); // Ensure loading is false after fetching
        }
      };

      fetchChildDataForParent();

      return () => {
        isActive = false;
      };
    }, [child?.child_id])
  );

  const formatDate = (dateString: string): string => {
    if (!dateString) return "ไม่ระบุวันที่"; // ตรวจสอบว่ามีค่าวันที่หรือไม่

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "วันที่ไม่ถูกต้อง"; // ตรวจสอบว่าค่าเป็นวันที่ถูกต้องหรือไม่

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // เดือนเริ่มจาก 0 จึงต้อง +1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // ตัวอย่างการใช้งาน
  console.log(formatDate("2024-02-25")); // แสดงผล: "25/02/2024"

  if (loading) {
    return <LoadingScreenBaby />;
  }
  // ============================================================================================

  // navigate
  const whenGotoEditChild = (child: Child) => {
    navigation.navigate("editchild", { child });
  };

  const whenGotoHome = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  // ============================================================================================
  const getAssessmentByAspect = (aspect: string) => {
    return assessments.find((a) => a.aspect === aspect) || {};
  };

  const gmAssessment = getAssessmentByAspect("GM");
  const fmAssessment = getAssessmentByAspect("FM");
  const rlAssessment = getAssessmentByAspect("RL");
  const elAssessment = getAssessmentByAspect("EL");
  const psAssessment = getAssessmentByAspect("PS");

  // ============================================================================================

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
              <Text style={styles.headerText}>ผลการประเมินล่าสุด</Text>
            </LinearGradient>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* GM */}
              {/* // if assessments.aspect === "GM" ให้แสดงข้อมูล */}
              <LinearGradient
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <Text style={styles.HeaderOfAssessmentText}>
                    Gross Motor(GM)
                  </Text>
                </View>
                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* วันที่และข้อ*/}
                  <View style={styles.DateNoContainer}>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>
                          วันที่ประเมินล่าสุด
                        </Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(gmAssessment.assessment_date)}
                        </Text>
                      </View>
                    </View>

                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {gmAssessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>
                        อายุพัฒนาการล่าสุด
                      </Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {gmAssessment.details?.age_range
                          ? gmAssessment.details.age_range
                          : "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
              {/* FM */}
              {/* // if assessments.aspect === "FM" ให้แสดงข้อมูล */}
              <LinearGradient
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <Text style={styles.HeaderOfAssessmentText}>
                    Fine Motor(FM)
                  </Text>
                </View>
                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* วันที่และข้อ*/}
                  <View style={styles.DateNoContainer}>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>
                          วันที่ประเมินล่าสุด
                        </Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(fmAssessment.assessment_date)}
                        </Text>
                      </View>
                    </View>

                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {fmAssessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>
                        อายุพัฒนาการล่าสุด
                      </Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {fmAssessment.details?.age_range
                          ? fmAssessment.details.age_range
                          : "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
              {/* RL */}
              {/* // if assessments.aspect === "RL" ให้แสดงข้อมูล */}
              <LinearGradient
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <Text style={styles.HeaderOfAssessmentText}>
                    Receptive Language(RL)
                  </Text>
                </View>
                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* วันที่และข้อ*/}
                  <View style={styles.DateNoContainer}>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>
                          วันที่ประเมินล่าสุด
                        </Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(rlAssessment.assessment_date)}
                        </Text>
                      </View>
                    </View>

                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {rlAssessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>
                        อายุพัฒนาการล่าสุด
                      </Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {rlAssessment.details?.age_range
                          ? rlAssessment.details.age_range
                          : "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* EL */}
              {/* // if assessments.aspect === "EL" ให้แสดงข้อมูล */}
              <LinearGradient
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <Text style={styles.HeaderOfAssessmentText}>
                    Expressive Language(EL)
                  </Text>
                </View>
                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* วันที่และข้อ*/}
                  <View style={styles.DateNoContainer}>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>
                          วันที่ประเมินล่าสุด
                        </Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(elAssessment.assessment_date)}
                        </Text>
                      </View>
                    </View>

                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {elAssessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>
                        อายุพัฒนาการล่าสุด
                      </Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {elAssessment.details?.age_range
                          ? elAssessment.details.age_range
                          : "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* PS */}
              {/* // if assessments.aspect === "PS" ให้แสดงข้อมูล */}
              <LinearGradient
                colors={["#fff", "#E0F6EE", "#D6F1E8"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.detailByAssess}
              >
                {/* Header */}
                <View style={styles.HeaderOfAssessment}>
                  <Text style={styles.HeaderOfAssessmentText}>
                    Personal and Social(PS)
                  </Text>
                </View>
                {/* Body */}
                <View style={styles.BodyOfAssesment}>
                  {/* วันที่และข้อ*/}
                  <View style={styles.DateNoContainer}>
                    {/* วันที่ */}
                    <View style={styles.DateContainer}>
                      <View style={styles.DateHeader}>
                        <Text style={styles.DateHeaderText}>
                          วันที่ประเมินล่าสุด
                        </Text>
                      </View>
                      <View style={styles.DateTextContainer}>
                        <Text style={styles.DateText}>
                          {formatDate(psAssessment.assessment_date)}
                        </Text>
                      </View>
                    </View>

                    {/* ข้อ */}
                    <View style={styles.NoHeaderContainer}>
                      <View style={styles.NoHeader}>
                        <Text style={styles.NoHeaderText}>ข้อ</Text>
                      </View>
                      <View style={styles.NoContainer}>
                        <Text style={styles.NoText}>
                          {psAssessment.assessment_details_id}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* อายุล่าสุด */}
                  <View style={styles.DevAgeContainer}>
                    <View style={styles.DevAgeHeader}>
                      <Text style={styles.DevAgeHeaderText}>
                        อายุพัฒนาการล่าสุด
                      </Text>
                    </View>
                    <View style={styles.DevAgeTextContainer}>
                      <Text style={styles.DevAgeText}>
                        {psAssessment.details?.age_range
                          ? psAssessment.details.age_range
                          : "-"}
                      </Text>
                      <Text style={styles.monthText}>เดือน</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </ScrollView>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={goBack}>
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
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
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
    paddingTop: "10%",
    alignItems: "center",
    // borderWidth: 2,
  },
  midSection: {
    flex: 1,
    width: "95%",
    height: "60%",
    alignSelf: "center",
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
    width: "100%",
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: "#8DD9BD",
    //justifyContent: "center",
    //borderWidth:1,
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
    //borderWidth:1,
    width: "95%",
  },
  DateNoContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    height: 35,
    //borderWidth:1,
    marginTop: 8,
  },

  DateContainer: {
    flexDirection: "row",
    //borderWidth:1,
    width: "65%",
    borderRadius: 8,
    marginLeft: 4,
  },

  DateHeader: {
    //flexDirection:"row",
    //borderWidth:1,
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
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
    backgroundColor: "#fff",
    width: "50%",
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

  NoHeaderContainer: {
    flexDirection: "row",
    //backgroundColor:"#fff",
    width: "31%",
    borderRadius: 8,
    marginRight: 4,
    marginLeft: "auto",
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

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    bottom: 5,
    marginTop: 10,
    marginBottom: 5,
  },

  // ============================================================================================
  headerTitleOfMidSection: {
    width: "auto",
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 10,
  },
});
