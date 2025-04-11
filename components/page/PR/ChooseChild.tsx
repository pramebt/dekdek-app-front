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
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingScreenBaby } from "../../LoadingScreen";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  Child,
  calculateAge,
  AssessmentDetails,
} from "../../../components/page/PR/HomePR";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Define API URL
import { API_ENDPOINT, API_GET_CHILD } from "@env";

export const ChooseChild: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child
  const [assessmentDetails, setAssessmentDetails] = useState<
    AssessmentDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchChildDataForParent = async () => {
        try {
          const parent_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!parent_id) {
            console.error("Parent ID is missing.");
            return;
          }

          setLoading(true);
          const response = await fetch(
            `${API_ENDPOINT}/${API_GET_CHILD}?parent_id=${parent_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();

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
              console.log("Assessments fetched:", allAssessments);
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
    }, [])
  );

  // === ( LoadingScreen ) ===
  if (loading) {
    return <LoadingScreenBaby />;
  }

  const whenGotoAddChild = () => {
    navigation.navigate("addchild");
  };

  const whenGotoDetail = (child: Child) => {
    navigation.navigate("childdetail", { child });
  };

  const whenGotoAssessment = (child: Child) => {
    navigation.navigate("assessment", { child });
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../../assets/background/bg2.png")}
        style={styles.background}
      >
        <Text style={styles.header}>เลือกเด็กที่ต้องการประเมิน</Text>
        {/* Profile Card Section */}
        <View style={styles.midSection}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children.length === 0 ? (
              <LinearGradient
                colors={["#CEC9FF", "#F5E5FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 2 }}
                style={styles.profileCardIntro}
              >
                <Image
                  source={require("../../../assets/icons/User_Icon.png")}
                  style={styles.profileIcon}
                />
                <View style={styles.profileInfo}>
                  <View style={styles.IntroContainer}>
                    <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                  </View>
                  <Pressable
                    style={styles.detailButtonIntro}
                    onPress={whenGotoAddChild}
                  >
                    <Text style={styles.detailTextIntro}>
                      เพิ่มข้อมูลเด็กที่นี่
                    </Text>
                  </Pressable>
                </View>
              </LinearGradient>
            ) : (
              children.map((child) => (
                <LinearGradient
                  key={child.child_id}
                  colors={
                    child.gender === "male"
                      ? ["#fff", "#E7F6FF", "#D6ECFD"]
                      : ["#fff", "#FFDEE4", "#FFBED6"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={
                    child.gender === "male"
                      ? styles.profileCardBoy
                      : styles.profileCardGirl
                  }
                >
                  <TouchableOpacity
                    onPress={() => whenGotoAssessment(child)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Image
                      source={
                        child.childPic
                          ? { uri: child.childPic }
                          : require("../../../assets/icons/User_Icon.png")
                      }
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
                        onPress={() => whenGotoDetail(child)}
                      >
                        <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                      </Pressable>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={goBack}>
              <Image
                source={require("../../../assets/icons/back.png")}
                style={styles.Icon}
              />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaProvider>
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
  },
  ScrollView: {
    width: "100%",

    borderRadius: 30,
  },
  midSection: {
    height: "70%",
    width: "90%",
    //borderWidth: 2,
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
  profileCardGirl: {
    marginHorizontal: 5,
    marginTop: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 5,
  },
  profileCardBoy: {
    marginHorizontal: 5,
    marginTop: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 5,
  },
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
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
  detailsName: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 9,
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
    borderRadius: 9,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
    marginVertical: 2,
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
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
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "70%",
    alignItems: "center",
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
