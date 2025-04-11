// Training.tsx
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
  RouteProp,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Child } from "../../page/SP/HomeSP";
// import { AssessmentDetails } from "../../page/SP/HomeSP";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";

type ChildRouteProp = RouteProp<{ assessment: { child: Child } }, "assessment">;

type AssessmentDetailsRouteProp = RouteProp<
  { assessment: { assessmentDetails: LocalAssessmentDetails } },
  "assessment"
>;

export interface LocalAssessmentDetails {
  assessment_details_id: number;
  aspect: string;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_sucession: string;
  training_method: string;
  training_device_name: string;
  training__device_image?: string;
}

// export interface TrainingDetails {
//   training_method: string;
//   training_device_name: string;
//   training__device_image?: string;
// }

export const TrainingSP: FC = () => {
  // route
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<ChildRouteProp>();
  const { child } = route.params;
  const route2 = useRoute<AssessmentDetailsRouteProp>();
  const { assessmentDetails: assessmentDetailsFromRoute } = route2.params;

  // ฟังก์ชันเพื่อแปลงอายุจากสตริงเป็นจำนวนเดือน
  const convertAgeToMonths = (age: string): number => {
    const [years, months] = age.split(" ปี ").map((part) => parseInt(part, 10));
    return years * 12 + months;
  };

  // useState
  // const [assessmentDetails, setAssessmentDetails] =
  //   useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect

  // const childAgeInMonths = convertAgeToMonths(child.age?.toString() || "");

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const fetchAssessmentDetail = async () => {
  //       setLoading(true);
  //       setError(null);

  //       try {
  //         const user_id = await AsyncStorage.getItem("userId");
  //         console.log(
  //           "Fetching data for child_id:",
  //           child.child_id,
  //           "user_id:",
  //           user_id
  //         );

  //         const response = await fetch(
  //           `https://senior-test-deploy-production-1362.up.railway.app/api/assessment/assessments-get-details/${child.child_id}/GM/${user_id}/${childAgeInMonths}`,
  //           { method: "GET" }
  //         );

  //         if (response.ok) {
  //           const data = await response.json();
  //           console.log("Fetched data:", data);

  //           // ตั้งค่า assessmentDetails เป็นข้อมูลภายใน details
  //           setAssessmentDetails(data.data.details);
  //           console.log("AssessmentDetails after set:", data.data.details);
  //         } else {
  //           setError(
  //             `Failed to fetch assessment data. Status: ${response.status}`
  //           );
  //         }
  //       } catch (error) {
  //         setError(
  //           "Error fetching assessment data. Please check your connection."
  //         );
  //         console.error("Error fetching assessment data:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchAssessmentDetail();
  //   }, [child.child_id])
  // );

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // calculateAgeRange

  const calculateAgeRange = (minMonths: number, maxMonths: number): string => {
    const formatAge = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ปี ${remainingMonths} เดือน`;
    };

    return `${formatAge(minMonths)} - ${formatAge(maxMonths)}`;
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate
  const whenGotoHome = () => {
    navigation.navigate("mainSP");
  };

  // navigate goBack
  const whenGoBack = () => {
    navigation.goBack();
  };
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const getAspectText = (aspect: string) => {
    switch (aspect) {
      case "GM":
        return "ด้านการเคลื่อนไหว (GM)";
      case "FM":
        return "ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)";
      case "EL":
        return "ด้านการเข้าใจภาษา (EL)";
      case "RL":
        return "ด้านการใช้ภาษา (RL)";
      case "PS":
        return "ด้านการช่วยเหลือตัวเองและสังคม (PS)";
      default:
        return "ไม่พบข้อมูล";
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentDevice
  const renderAssessmentDevice = () => {
    if (!assessmentDetailsFromRoute) {
      console.log("assessmentDetailsFromRoute is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetailsFromRoute ไม่มีค่า null
    }

    console.log("assessmentDetailsFromRoute:", assessmentDetailsFromRoute);

    if (
      assessmentDetailsFromRoute.training_method === "none" &&
      assessmentDetailsFromRoute.training_device_name === "none" &&
      assessmentDetailsFromRoute.training__device_image === "none"
    ) {
      return null; // ไม่แสดง renderAssessmentDevice
    }

    return (
      <View style={styles.assessmentDevice}>
        {/* {assessmentDetailsFromRoute.training__device_image !== "none" && (
          <Image
            source={getImageSource(
              assessmentDetailsFromRoute.training__device_image ?? ""
            )}
            style={styles.deviceIcon}
          />
        )} */}
        {assessmentDetailsFromRoute.training_device_name !== "none" && (
          <View>
            <Text style={styles.deviceText}>อุปกรณ์ที่ใช้: </Text>
            <Text style={styles.deviceDetail}>
              {assessmentDetailsFromRoute.training_device_name}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //imageMap

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
  };

  const getImageSource = (imagePath: string): any => {
    return (
      imageMap[imagePath] || require("../../../assets/icons/trainingIcon.png")
    );
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
          </View>

          {/* Mid Section */}
          <View style={styles.midSection}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={styles.containerSection}>
                {/* assessment header */}
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerText}>
                    {getAspectText(assessmentDetailsFromRoute?.aspect)}
                  </Text>
                  <Text style={styles.headerAgeContainer}>
                    อายุพัฒนาการ:{" "}
                    {assessmentDetailsFromRoute?.age_range
                      ? calculateAgeRange(
                          ...(assessmentDetailsFromRoute.age_range
                            .split("-")
                            .map(Number) as [number, number])
                        )
                      : "ข้อมูลไม่สมบูรณ์"}
                  </Text>
                </View>
                {/* assessment rank */}
                {assessmentDetailsFromRoute && (
                  <>
                    <View style={styles.assessmentTop}>
                      <View style={styles.assessmentNumberContainer}>
                        <Text style={styles.assessmentNumber}>
                          {assessmentDetailsFromRoute?.assessment_details_id}
                        </Text>
                      </View>

                      <View style={styles.assessmentTitleContainer}>
                        <Text style={styles.assessmentTitle}>
                          {assessmentDetailsFromRoute.assessment_name}
                        </Text>
                      </View>
                    </View>
                    {/* assessment logo */}
                    {assessmentDetailsFromRoute?.assessment_image && (
                      <Image
                        source={getImageSource(
                          assessmentDetailsFromRoute.assessment_image
                        )}
                        style={styles.assessmentLogo}
                      />
                    )}

                    {/* assessment device */}
                    {assessmentDetailsFromRoute &&
                      (assessmentDetailsFromRoute.training_method !== "none" ||
                        assessmentDetailsFromRoute.training__device_image !==
                          "none" ||
                        assessmentDetailsFromRoute.training_device_name !==
                          "none") &&
                      renderAssessmentDevice()}

                    {/* assessment how to */}
                    <View style={styles.assessmentHowto}>
                      <Text style={styles.headerHowto}>วิธีฝึกทักษะ</Text>
                      <Text style={styles.howtoText}>
                        {assessmentDetailsFromRoute.training_method}
                      </Text>
                    </View>
                    {/* assessment result */}
                    <View style={styles.assessmentResult}>
                      <Text style={styles.resultText}>
                        ให้ทำการฝึกตามวิธีทักษะข้างต้น
                        และทำแบบประเมินใหม่อีกครั้ง ภายใน 1-2 สัปดาห์
                      </Text>

                      <View style={styles.resultButtonCantainer}>
                        <Pressable
                          style={styles.tryAgainButton}
                          onPress={() => {
                            whenGoBack();
                          }}
                        >
                          <Image
                            source={require("../../../assets/icons/tryAgain.png")}
                            style={styles.tryAgainIcon}
                          />
                          <Text style={styles.tryAgainText}>
                            ประเมินใหม่อีกครั้ง
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.sucessButton} onPress={whenGotoHome}>
                <Text style={styles.sucessText}>เสร็จสิ้น</Text>
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
    justifyContent: "center",
    paddingTop: "9%",
    // borderWidth: 2,
  },
  topSection: {
    // flex: 1,
    width: "100%",
    height: "12%",
    alignItems: "center",
    // marginTop: "5%",
    // borderWidth: 2,
  },
  midSection: {
    width: "100%",
    height: "77%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "center",
  },
  containerSection: {
    flex: 1,
    width: "100%",
    height: "auto",
    minHeight: 300,
    marginTop: 5,
    paddingBottom: "5%",
    borderRadius: 20,
    shadowColor: "#c5c5c5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#fff",
    alignItems: "center",
    overflow: "hidden", // Add this line to prevent overflow
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
    width: "85%",
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
    width: "85%",
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
    width: "100%",
    height: "15%",
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
    width: 220,
    height: "auto",
    marginTop: 5,
    marginBottom: 5,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    //borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentLogo: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 15,
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentDevice: {
    width: "90%",
    paddingVertical: 10,
    marginBottom: 5,
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
    textAlign: "center",
    // borderWidth: 1,
  },
  deviceIcon: {
    width: 70,
    height: 70,
    // borderWidth: 1,
  },
  deviceDetail: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
    paddingHorizontal: 10,
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentHowto: {
    width: "90%",
    height: "auto",
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1, // line
  },
  headerHowto: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    //borderWidth: 2,
  },
  howtoText: {
    fontSize: 13,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  headerResultContainer: {
    width: "100%",
    height: 40,
    borderRadius: 30,
    backgroundColor: "#5F5F5F",
    justifyContent: "center",
  },
  assessmentResult: {
    width: "90%",
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 20,
    // borderWidth: 1,
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
    fontWeight: "bold",
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  resultButtonCantainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-around",
    //marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    // borderWidth: 2,
  },
  tryAgainButton: {
    backgroundColor: "#8DD9BD",
    padding: 15,
    borderRadius: 30,
    width: "auto",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  tryAgainText: {
    fontSize: 13,
    marginLeft: 5,
  },
  tryAgainIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  buttonContainer: {
    flexDirection: "row",
    width: "90%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center", // Center the button horizontally
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
});
