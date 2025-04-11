import React, { FC, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableHighlight,
  Dimensions,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  usePushNotifications,
  sendExpoPushTokenToBackend,
} from "../../../app/usePushNotifications";

import { LoadingScreenBaby } from "../../LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, PieChart } from "react-native-chart-kit";

export interface Child {
  child_id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
}
type AssessmentData = {
  message: string;
  data: {
    aspect: string;
    passed_count: number;
    not_passed_count: number;
    not_passed_children?: {
      child_id: number;
      firstName: string;
      lastName: string;
      nickName: string;
      birthday: string;
      gender: string;
      childPic: string;
      age_months: number;
    }[];
  }[];
  summary: {
    passed_count: number;
    not_passed_count: number;
  };
};

export interface Room {
  rooms_id: number;
  rooms_name: string;
  roomsPic: string;
  child_count: number;
  colors: string;
}

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

interface HomeSPProps {
  setNotificationCount: (count: number) => void;
}

// Define API URL
import {
  API_ENDPOINT,
  API_MIDDLEWARE_REFRESH_TOKEN,
  API_GET_NOTIFICATE,
  API_GET_ALLDATA,
  API_ASSESSMENT_DATA,
} from "@env";

export const HomeSP: React.FC<HomeSPProps> = ({ setNotificationCount }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRoom] = useState<Room[]>([]);
  const [dashboardData, setDashboardData] = useState<AssessmentData | null>(
    null
  );
  const [notPassedChildrenState, setNotPassedChildrenState] = useState<
    { child_id: number; name: string; age_months: number; aspect: string }[]
  >([]);
  const [children, setChildren] = useState<Child[]>([]);

  const { expoPushToken } = usePushNotifications();
  const colorGradients: { [key: string]: [string, string, ...string[]] } = {
    "#FFA2C4": ["#FFE3ED", "#FFC9DD"], // pink
    "#F9C167": ["#FFF8EC", "#FFE0AE"], // yellow
    "#8DD9BD": ["#EAFFF7", "#C9F3E4"], // low green
    "#98D4FF": ["#EAF6FF", "#B7E1FF"], // low blue
    "#B695F8": ["#EAE0FF", "#D6C2FF"], // purple
    // "#1ABC9C": ["#FFFFFF", "#48E0C2", "#A0FFF2"], // เขียวอมฟ้า
    // "#E74C3C": ["#FFFFFF", "#FF7675", "#FFC3B9"], // แดงอ่อน
  };
  const defaultGradient: [string, string] = ["#c5e5fc", "#ffffff"];
  const screenWidth = Dimensions.get("window").width;

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

  // useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!supervisor_id) {
            console.error("Supervisor ID is missing.");
            return;
          }

          if (!token) {
            console.error("Token is missing.");
            return;
          }

          setLoading(true);

          if (expoPushToken) {
            const user_id = parseInt(supervisor_id, 10);
            if (!isNaN(user_id)) {
              await sendExpoPushTokenToBackend(expoPushToken, user_id);
            } else {
              console.error("Invalid user ID.");
            }
          }

          // Fetch Room Data
          const roomResponse = await fetch(
            `${API_ENDPOINT}/${API_GET_ALLDATA}?supervisor_id=${supervisor_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-refresh-token": refreshToken ?? "",
              },
            }
          );

          if (roomResponse.ok) {
            const jsonResponse = await roomResponse.json();
            console.log("json response HOME: ", jsonResponse);

            if (jsonResponse.rooms) {
              const updatedRoom: Room[] = jsonResponse.rooms.map(
                (rooms: Room) => {
                  const imageUrl = `${API_ENDPOINT}/${rooms.roomsPic}`;
                  return {
                    ...rooms,
                    roomsPic: imageUrl,
                    colors: rooms.colors || "#c5e5fc",
                  };
                }
              );

              setRoom(updatedRoom);
            } else {
              setRoom([]);
            }
          } else {
            console.error(
              "HTTP Error: ",
              roomResponse.status,
              roomResponse.statusText
            );
          }

          // Fetch Dashboard Data
          const dashboardResponse = await fetch(
            `${API_ENDPOINT}/${API_ASSESSMENT_DATA}/${supervisor_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log("Dashboard Data: ", dashboardData);

            if (dashboardData.data) {
              const updatedChildren: Child[] = dashboardData.data.flatMap(
                (item: { not_passed_children: any[] }) =>
                  item.not_passed_children
                    ?.filter(Boolean) // ✅ กรองค่าที่เป็น null ออกจาก array
                    .map((child: { birthday: string; childPic: any }) => {
                      const { years, months } = calculateAge(child.birthday);
                      const imageUrl = `${API_ENDPOINT}/${child.childPic}`;
                      return {
                        ...child,
                        age: `${years} ปี ${months} เดือน`,
                        childPic: imageUrl,
                      };
                    }) ?? []
              );

              console.log("Updated Children: ", updatedChildren);
              setChildren(updatedChildren);
            }

            setDashboardData(dashboardData); // ✅ บันทึก dashboardData ลง state
          } else {
            console.error(
              "HTTP Error: ",
              dashboardResponse.status,
              dashboardResponse.statusText
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Error retrieving data:", error);
          setLoading(false);
        }
      };

      fetchData();
    }, [expoPushToken])
  );

  const whenGotoAddroom = () => {
    navigation.navigate("addroom");
  };

  const whengotoChooseChildSP = (rooms: Room) => {
    navigation.navigate("choosechildsp", { rooms });
  };

  const whenGotoChooseRoom = () => {
    navigation.navigate("chooseroom");
  };
  const whenGotoGraphDashboard = () => {
    navigation.navigate("graphdashboard");
  };
  const whenGotoAspectSP = (child: Child) => {
    navigation.navigate("aspectsp", { child });
  };

  // ดึงข้อมูลด้านพัฒนาและแยกค่าผ่าน/ไม่ผ่าน
  const labels = dashboardData?.data?.map((item) => item.aspect) ?? [];
  const passedCounts =
    dashboardData?.data?.map((item) => Number(item.passed_count) || 0) ?? [];
  const notPassedCounts =
    dashboardData?.data?.map((item) => Number(item.not_passed_count) || 0) ??
    [];

  // สร้างข้อมูล Pie Chart แสดงเด็กที่ไม่ผ่านในแต่ละ Aspect
  const pieDataByAspect =
    dashboardData?.data
      ?.filter((item) => item.not_passed_count > 0) // นับเฉพาะ Aspect ที่มีเด็กไม่ผ่าน
      ?.map((item, index) => ({
        name: item.aspect,
        population: item.not_passed_count,
        color: ["#FF6B6B", "#FFA07A", "#FFD700", "#8A2BE2", "#5F9EA0"][
          index % 5
        ], // ใช้สีวนซ้ำ
        legendFontColor: "#000",
        legendFontSize: 14,
      })) ?? [];

  const pieDataByAspectFiltered =
    dashboardData?.data
      ?.filter((item) => item.not_passed_count > 0) // ✅ กรองเฉพาะด้านที่มีเด็กไม่ผ่าน
      ?.map((item, index) => ({
        name: item.aspect,
        population: Number(item.not_passed_count), // ✅ แปลงค่าให้เป็นตัวเลขแน่ๆ
        color: ["#FF6B6B", "#FFA07A", "#FFD700", "#8A2BE2", "#5F9EA0"][
          index % 5
        ],
        legendFontColor: "#000",
        legendFontSize: 14,
      })) ?? [];

  console.log("Pie Chart Data (Filtered):", pieDataByAspectFiltered);

  // กรองเฉพาะเด็กที่ไม่ผ่านจาก dashboardData
  // ✅ ใช้ flatMap() แทน find() เพื่อให้เด็กแต่ละคนมี aspect ที่ถูกต้อง
  const notPassedChildren =
    dashboardData?.data.flatMap((item) =>
      item.not_passed_children
        ?.filter(Boolean) // ✅ ลบ null ออก
        .map((child) => ({
          ...child,
          aspect: item.aspect, // ✅ ผูก aspect กับเด็กแต่ละคน
          age: `${calculateAge(child.birthday).years} ปี ${
            calculateAge(child.birthday).months
          } เดือน`,
          childPic: `${API_ENDPOINT}/${child.childPic}`,
        }))
    ) ?? [];

  console.log("Filtered Not Passed Children:", notPassedChildren);

  const totalPassed = dashboardData?.data?.reduce(
    (sum, item) => sum + (Number(item.passed_count) || 0),
    0
  );
  const totalNotPassed = pieDataByAspect.reduce(
    (sum, item) => sum + item.population,
    0
  );
  console.log("Total Not Passed Children in Pie Chart:", totalNotPassed);

  // ✅ ลบเด็กที่ซ้ำกัน โดยรวม Aspect ไว้เป็น Array
  const uniqueNotPassedChildren = Object.values(
    notPassedChildren.reduce<Record<number, any>>((acc, child) => {
      if (!child) return acc; // ✅ ป้องกัน undefined
      if (!acc[child.child_id]) {
        acc[child.child_id] = { ...child, aspects: [child.aspect] };
      } else {
        acc[child.child_id].aspects.push(child.aspect);
      }
      return acc;
    }, {})
  );

  if (loading) {
    return <LoadingScreenBaby />;
  }

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../../assets/background/bg2.png")}
        style={styles.background}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.scrollviewALL}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                {/* Top Section */}
                <View style={styles.topSection}>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  >
                    {/* <View style={styles.roomInfo}> */}
                    <ScrollView
                      horizontal={true}
                      style={styles.ScrollView}
                      contentContainerStyle={styles.scrollContent}
                      showsHorizontalScrollIndicator={false}
                    >
                      {rooms.length === 0 ? (
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
                              <Text style={styles.TextIntro}>
                                กรุณาเพิ่มข้อมูลห้องก่อน
                              </Text>
                            </View>
                            <Pressable
                              style={styles.detailButtonIntro}
                              onPress={whenGotoAddroom}
                            >
                              <Text style={styles.detailTextIntro}>
                                เพิ่มข้อมูลห้องที่นี่
                              </Text>
                            </Pressable>
                          </View>
                        </LinearGradient>
                      ) : (
                        rooms.map((rooms) => (
                          <Pressable
                            key={rooms.rooms_id}
                            onPress={() => whengotoChooseChildSP(rooms)}
                          >
                            <LinearGradient
                              colors={
                                colorGradients[rooms.colors] ?? defaultGradient
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.CardRoom}
                            >
                              <Image
                                source={
                                  rooms.roomsPic
                                    ? { uri: rooms.roomsPic }
                                    : require("../../../assets/icons/User_Icon.png")
                                }
                                style={styles.profileIcon}
                              />
                              <View style={styles.profileInfo}>
                                <View style={styles.detailsName}>
                                  <Text style={styles.profileName}>
                                    {rooms.rooms_name}
                                  </Text>
                                </View>
                                <View style={styles.detailsChildCount}>
                                  <Text style={styles.childCount}>
                                    {rooms.child_count} คน
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </Pressable>
                        ))
                      )}
                    </ScrollView>
                    {/* </View> */}
                  </ScrollView>
                </View>

                {/* Add room */}
                <View style={styles.addContainer}>
                  <View>
                    <TouchableOpacity onPress={whenGotoAddroom}>
                      <LinearGradient
                        colors={["#F5E5FF", "#E1D7FF", "#CEC9FF"]}
                        locations={[0, 0.5, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addButton}
                      >
                        <Image
                          source={require("../../../assets/icons/group.png")}
                          style={styles.icon}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Middle Section */}
                <View style={styles.middleSection}>
                  <TouchableOpacity onPress={whenGotoChooseRoom}>
                    <LinearGradient
                      colors={["#FFFFFF", "#E6FFF0", "#DCF5F0"]}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.evaluateButton}
                    >
                      <Image
                        source={require("../../../assets/icons/assessmentSP.png")}
                        style={styles.asessmentIcon}
                      />
                      <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Bottom Section */}
                <View
                  style={{
                    borderRadius: 10,
                    padding: 20,
                    marginHorizontal: 10,
                    minHeight: 600,
                    flexGrow: 1,
                  }}
                >
                  {/* กราฟ BarChart */}
                  <View style={styles.graphContainer}>
                    <View style={{ zIndex: 1 }}>
                      {/* <TouchableOpacity
                      // onPress={() => whenGotoGraphDashboard()}
                      disabled={false}
                    >
                      <Image
                        style={styles.moreGraghIcon}
                        source={require("../../../assets/icons/moreChart.png")}
                      />
                    </TouchableOpacity> */}
                    </View>
                    <Text style={styles.chartTitle}>
                      จำนวนเด็กที่ผ่านแต่ละด้าน
                    </Text>
                    <BarChart
                      data={{
                        labels: labels, // รายการด้านพัฒนาการ
                        datasets: [
                          {
                            data: passedCounts, // ✅ จำนวนเด็กที่ผ่าน
                            colors: passedCounts.map(
                              () => () => `rgba(76, 175, 80, 1)`
                            ), // ✅ สีเขียว
                          },
                        ],
                      }}
                      width={screenWidth - 80}
                      height={180}
                      yAxisLabel=""
                      yAxisSuffix=""
                      yAxisInterval={4}
                      chartConfig={{
                        backgroundGradientFrom: "#f0f0f0",
                        backgroundGradientTo: "#f0f0f0",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) =>
                          `rgba(0, 0, 0, ${opacity})`,
                        barPercentage: 0.4, // ✅ ทำให้แท่งอยู่ใกล้กันมากขึ้น
                        fillShadowGradientOpacity: 1, // ✅ ทำให้สีชัดขึ้น
                      }}
                      fromZero
                      showBarTops={true}
                      showValuesOnTopOfBars
                      withCustomBarColorFromData={true}
                    />
                  </View>

                  {/* Pie Chart แสดงอัตราส่วนเด็กที่ไม่ผ่านแยกตาม Aspect */}
                  <View style={styles.pieChartContainer}>
                    <Text style={styles.chartTitle}>
                      อัตราส่วนเด็กที่ไม่ผ่านแต่ละด้าน
                    </Text>
                    {pieDataByAspect.length > 0 ? (
                      <PieChart
                        data={pieDataByAspectFiltered}
                        width={screenWidth - 40}
                        height={180}
                        chartConfig={{
                          backgroundGradientFrom: "#f0f0f0",
                          backgroundGradientTo: "#f0f0f0",
                          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          decimalPlaces: 0,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute={true} // ✅ ใช้ absolute เพื่อให้แสดงค่าจำนวนเต็มแทน %
                      />
                    ) : (
                      <Text style={{ textAlign: "center", marginTop: 10 }}>
                        ไม่มีเด็กที่ไม่ผ่านการประเมิน
                      </Text>
                    )}
                  </View>

                  {/* รายชื่อเด็กที่ไม่ผ่าน */}
                  <View style={styles.notPassedContainer}>
                    <Text style={styles.chartTitle}>รายชื่อเด็กที่ไม่ผ่าน</Text>
                    {uniqueNotPassedChildren.length > 0 ? (
                      uniqueNotPassedChildren.map((child) =>
                        child ? (
                          <TouchableOpacity
                            key={child.child_id}
                            style={styles.childCard}
                            onPress={() => whenGotoAspectSP(child)}
                          >
                            <Text style={styles.childText}>
                              {child.firstName} {child.lastName} - (ไม่ผ่าน:{" "}
                              {child.aspects.join(", ")})
                            </Text>
                          </TouchableOpacity>
                        ) : null
                      )
                    ) : (
                      <Text style={{ textAlign: "center", marginTop: 10 }}>
                        ไม่มีเด็กที่ไม่ผ่านการประเมิน
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
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
    height: "100%",
    // borderWidth: 2,
  },
  container: {
    flex: 1,
  },
  scrollviewALL: {
    // flexGrow: 1,
    maxHeight: "89%",
    borderRadius: 20,
    // borderWidth: 2,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "5%",
    borderRadius: 30,
    width: "100%",
    // borderWidth: 2,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFEFD5",
    padding: 10,
    borderRadius: 10,
    width: 110,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    // elevation: 2,
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    width: "100%",
    height: "100%",
    // borderWidth: 2,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    // borderWidth: 2,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  countText: {
    fontSize: 12,
    color: "#555",
  },

  //----------------------------------------------------------------
  // add
  addContainer: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    margin: 5,
    paddingHorizontal: 20,
    // borderWidth: 2,
  },
  addButton: {
    backgroundColor: "#000",
    borderRadius: 30,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 10,
    // borderWidth: 2,
  },

  //----------------------------------------------------------------

  middleSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    marginBottom: 10,
    paddingHorizontal: 20,
    // borderWidth: 2,
  },
  evaluateButton: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    width: "100%",
    height: 95,
    // borderWidth: 1,
  },
  asessmentIcon: {
    width: 65,
    height: 65,
    marginLeft: 10,
  },
  evaluateText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  //------------------------------------------------------------------
  bottomSection: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    marginVertical: 10,
    height: "auto",
    marginBottom: 100,
  },
  graphContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    borderRadius: 10,
    height: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  graphImage: {
    width: "100%",
    height: "90%",
  },
  moreGraghIcon: {
    width: 25,
    height: 25,
    position: "absolute",
    top: 0,
    right: 10,
  },
  pieChartContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: "#f0f0f0",
    marginTop: 30,
    borderRadius: 10,
  },
  pieChartImage: {
    width: "80%",
    height: "auto",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#E0FFFF",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
  //------------------------------------------------------------------
  CardRoom: {
    alignItems: "center",
    width: 115,
    height: 145,
    marginHorizontal: 10,
    padding: 5,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    // borderWidth: 2,
  },
  ScrollView: {
    flex: 1,
    width: "100%",
    borderRadius: 20,
    height: "100%",
    // borderWidth: 2,
  },
  scrollContent: {
    flexDirection: "row",
    paddingVertical: 5,
    height: "100%",
  },
  profileCardIntro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b0b0b0",
    padding: 10,
    marginLeft: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 350,
    height: 130,
    // borderWidth: 2,
  },
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    alignItems: "center",
  },
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
    // borderWidth: 2,
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
  detailsName: {
    width: 100,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 30,
    alignItems: "center",
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  detailsChildCount: {
    width: 80,
    marginTop: 2,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 30,
    alignItems: "center",
  },
  childCount: {
    fontSize: 14,
    fontWeight: "bold",
  },

  //====================================================================
  //=====================  Chart Details  ============================
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 5,
    marginBottom: 10,
    // borderWidth: 2,
  },
  notPassedContainer: {
    flexGrow: 1,
    // borderWidth: 2,
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  childCard: {
    backgroundColor: "#FFDDDD",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  childText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
