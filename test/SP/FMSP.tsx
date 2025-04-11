// FM.tsx
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

type GMRouteProp = RouteProp<{ assessment: { child: Child } }, "assessment">;

export interface AssessmentDetails {
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
}

export interface AssessmentInsert {
  // assessment_id: number;
  supervisor_assessment_id: number;
}

export interface UserId {
  // user_id: number;
  supervisor_id: number;
}

export const FMSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<GMRouteProp>();
  const { child } = route.params;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect

  // console.log("child:", child.age);

  const childAgeInMonths = convertAgeToMonths(child.age?.toString() || "");

  // console.log("childAgeInMonths:", childAgeInMonths);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAssessmentDetail = async () => {
        setLoading(true);
        setError(null);

        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          console.log(
            "Fetching data for child_id:",
            child.child_id,
            "user_id:",
            supervisor_id
          );

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-get-details-supervisor/${child.child_id}/FM/${supervisor_id}/${childAgeInMonths}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Fetched data:", data);

            setUserId({ supervisor_id: parseInt(supervisor_id || "0", 10) });
            setAssessmentDetails(data.data.details);
            // console.log("AssessmentDetails after set:", data.data.details);
            setAssessmentInsert({
              // assessment_id: data.data.assessment_id,
              supervisor_assessment_id: data.data.supervisor_assessment_id,
            });
            console.log(
              "supervisor_assessment_id after set:",
              data.data.supervisor_assessment_id
            );
            setTimeout(() => {
              setLoading(false);
            }, 1000); // set delay
            // console.log("AssessmentInsert after set:", data.data.assessment_id);
          } else {
            setError(
              `Failed to fetch assessment data. Status: ${response.status}`
            );
            setLoading(false);
          }
        } catch (error) {
          setError(
            "Error fetching assessment data. Please check your connection."
          );
          setLoading(false);
          console.error("Error fetching assessment data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAssessmentDetail();
    }, [child.child_id])
  );

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // ตรวจสอบค่า assessmentInsert.assessment_id
  useEffect(() => {
    if (assessmentInsert) {
      console.log(
        "Current supervisor_assessment_id:",
        assessmentInsert.supervisor_assessment_id
      );
    } else {
      console.log("assessmentInsert is null or undefined");
    }
  }, [assessmentInsert]);

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

  const whenGotoTraining = (assessmentDetails: AssessmentDetails) => {
    navigation.navigate("training", { child, assessmentDetails });
  };

  const whenGotoHomeSP = () => {
    navigation.navigate("mainSP");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentDevice
  const renderAssessmentDevice = () => {
    if (!assessmentDetails) {
      console.log("assessmentDetails is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetails ไม่มีค่า null
    }

    // console.log("assessmentDetails:", assessmentDetails);

    if (
      assessmentDetails.assessment_device_name === "none" &&
      assessmentDetails.assessment_device_image === "none" &&
      assessmentDetails.assessment_device_detail === "none"
    ) {
      return null; // ไม่แสดง renderAssessmentDevice
    }

    return (
      <View style={styles.assessmentDevice}>
        {assessmentDetails.assessment_device_name !== "none" && (
          <Text style={styles.deviceText}>
            อุปกรณ์: {assessmentDetails.assessment_device_name}
          </Text>
        )}
        {assessmentDetails.assessment_device_image !== "none" && (
          <Image
            source={getImageSource(
              assessmentDetails.assessment_device_image ?? ""
            )}
            style={styles.deviceIcon}
            resizeMode="contain"
          />
        )}
        {assessmentDetails.assessment_device_detail !== "none" && (
          <Text style={styles.deviceDetail}>
            {assessmentDetails.assessment_device_detail}
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

    "redball.png": require("../../../assets/assessment/Device/redball.png"),
    "maracus.png": require("../../../assets/assessment/Device/maracus.png"),
    "storybook.png": require("../../../assets/assessment/Device/storybook.png"),
    "squarewooden.png": require("../../../assets/assessment/Device/squarewooden.png"),
    "paperpencil.png": require("../../../assets/assessment/Device/paperpencil.png"),
    "split3.png": require("../../../assets/assessment/Device/split3.png"),
    "circleonmiddle.png": require("../../../assets/assessment/Device/circleonmiddle.png"),
    "paperscissor.png": require("../../../assets/assessment/Device/paperscissor.png"),
    "split8.png": require("../../../assets/assessment/Device/split8.png"),
    "squareonmiddle.png": require("../../../assets/assessment/Device/squareonmiddle.png"),
    "scissorpaperline.png": require("../../../assets/assessment/Device/Scissorpaperline.png"),
    "triangleonmiddle.png": require("../../../assets/assessment/Device/triangleonmiddle.png"),
    "squaretrianglecircle.png": require("../../../assets/assessment/Device/squaretrianglecircle.png"),
    "smallthing.png": require("../../../assets/assessment/Device/smallthing.png"),
    //"scissorpaperline.png": require("../../assets/assessment/Device/scissorpaperline.png"),
  };

  const getImageSource = (imagePath: string): any => {
    return imageMap[imagePath] || require("../../../assets/icons/banana.png");
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api fetch next assessment

  const fetchNextAssessment = async (
    child_id: number,
    aspect: string,
    supervisor_assessment_id: number,
    supervisor_id: number
  ) => {
    console.log("child_id", child_id);
    console.log("supervisor_assessment_id", supervisor_assessment_id);
    console.log("supervisor_id", supervisor_id);
    console.log("aspect", aspect);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-next-supervisor/${child_id}/${aspect}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ supervisor_assessment_id, supervisor_id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched next assessment:", data);
        if (data.next_assessment.status === "passed_all") {
          setAssessmentDetails(null); // ล้างข้อมูล assessment
          setAssessmentInsert(null); // ล้าง assessmentInsert
          // Update state with the fetched data
        } else {
          setUserId({ supervisor_id: data.next_assessment.supervisor_id });
          setAssessmentDetails(data.next_assessment.details);
          setAssessmentInsert({
            // assessment_id: data.next_assessment.assessment_id,
            supervisor_assessment_id:
              data.next_assessment.supervisor_assessment_id,
          });
          console.log("supervisor_assessment_id: ", supervisor_assessment_id);
        }
        return data;
      } else {
        console.error("Failed to fetch next assessment:", response.status);
      }
    } catch (error) {
      console.error("Error fetching next assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api fetch NotpassAssessment

  const NotpassAssessment = async (
    supervisor_assessment_id: number
    // assessmentDetails:assessmentDetails,
  ) => {
    console.log("supervisor_assessment_id", supervisor_assessment_id);
    // setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-not-passed-supervisor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ supervisor_assessment_id }),
        }
      );

      if (response.ok) {
        // const data = await response.json();
        // console.log("Fetched next assessment:", data);
        // return data;
        navigation.navigate("trainingsp", { child, assessmentDetails });
      } else {
        console.error("Failed to fetch next assessment:", response.status);
      }
    } catch (error) {
      console.error("Error fetching next assessment:", error);
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
                ) : assessmentDetails ? (
                  <>
                    {/* assessment header */}
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.headerText}>
                        ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)
                      </Text>
                      <Text style={styles.headerAgeContainer}>
                        อายุพัฒนาการ:{" "}
                        {assessmentDetails?.age_range
                          ? calculateAgeRange(
                              ...(assessmentDetails.age_range
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
                          {assessmentDetails?.assessment_details_id}
                        </Text>
                      </View>
                      <Text style={styles.assessmentTitle}>
                        {assessmentDetails?.assessment_name ?? "ไม่มีข้อมูล"}
                      </Text>
                    </View>

                    {assessmentDetails?.assessment_image && (
                      <Image
                        source={getImageSource(
                          assessmentDetails.assessment_image
                        )}
                        style={styles.assessmentLogo}
                      />
                    )}

                    {/* assessment device */}
                    {assessmentDetails &&
                      (assessmentDetails.assessment_device_name !== "none" ||
                        assessmentDetails.assessment_device_image !== "none" ||
                        assessmentDetails.assessment_device_detail !==
                          "none") &&
                      renderAssessmentDevice()}

                    {/* assessment how to */}
                    <View style={styles.assessmentHowto}>
                      <Text style={styles.headerHowto}>วิธีการประเมิน</Text>
                      <Text style={styles.howtoText}>
                        {assessmentDetails?.assessment_method ?? "ไม่มีข้อมูล"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.passAllAssessDetailcontainer}>
                    <View style={styles.headerPassAllTextContainer}>
                      <Text style={styles.headerPassAllText}>
                        ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)
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
              ) : assessmentDetails ? (
                <View style={styles.assessmentResult}>
                  <View style={styles.headerResultContainer}>
                    <Text style={styles.headerResult}>ผลการประเมิน</Text>
                  </View>
                  <Text style={styles.resultText}>
                    {assessmentDetails?.assessment_succession ?? "ไม่มีข้อมูล"}
                  </Text>

                  <View style={styles.resultButtonCantainer}>
                    <Pressable
                      style={styles.yesButton}
                      onPress={() => {
                        if (assessmentInsert) {
                          console.log(
                            "Calling fetchNextAssessment with assessmentInsert_id:",
                            assessmentInsert.supervisor_assessment_id
                          );
                          fetchNextAssessment(
                            child.child_id,
                            "FM",
                            assessmentInsert.supervisor_assessment_id,
                            userId?.supervisor_id ?? 0
                          );
                        } else {
                          console.log("assessmentInsert is null or undefined");
                        }
                      }}
                    >
                      <Text>ได้</Text>
                    </Pressable>
                    <Pressable
                      style={styles.noButton}
                      onPress={() => {
                        if (assessmentInsert) {
                          console.log(
                            "Calling fetchNextAssessment with assessmentInsert_id:",
                            assessmentInsert.supervisor_assessment_id
                          );
                          NotpassAssessment(
                            assessmentInsert.supervisor_assessment_id
                          );
                        } else {
                          console.log("assessmentInsert is null or undefined");
                        }
                      }}
                    >
                      <Text>ไม่ได้</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <></>
              )}
            </ScrollView>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={goBack}>
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
});
