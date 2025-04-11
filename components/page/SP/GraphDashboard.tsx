import React, { FC, useState, useRef } from "react";
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

// import DatePicker from "react-native-date-picker";
import {} from "../../LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, PieChart } from "react-native-chart-kit";
type AssessmentData = {
  message: string;
  data: {
    aspect: string;
    passed_count: number;
    not_passed_count: number;
  }[];
  summary: {
    passed_count: number;
    not_passed_count: number;
  };
};

export const GraphDashboard = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);

  const [dashboardData, setDashboardData] = useState<AssessmentData | null>();
  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(
    React.useCallback(() => {
      const fetchDashboardData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          if (!supervisor_id) {
            console.error("Supervisor ID is missing.");
            return;
          }

          setLoading(true);

          const dashboardResponse = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-data-supervisor-more/${supervisor_id}`,
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
            setDashboardData(dashboardData); // Ensure you have a state variable for this
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

      fetchDashboardData();
    }, [])
  );
  //================================================================================================
  // ============ whenGoto Function ============

  const goBack = () => {
    navigation.goBack();
  };
  // ดึงข้อมูลด้านพัฒนาและแยกค่าผ่าน/ไม่ผ่าน
  const labels = dashboardData?.data?.map((item) => item.aspect) ?? [];
  const passedCounts =
    dashboardData?.data?.map((item) => Number(item.passed_count) || 0) ?? [];
  const notPassedCounts =
    dashboardData?.data?.map((item) => Number(item.not_passed_count) || 0) ??
    [];
  const totalPassed = dashboardData?.data?.reduce(
    (sum, item) => sum + (Number(item.passed_count) || 0),
    0
  );
  const totalNotPassed = dashboardData?.data?.reduce(
    (sum, item) => sum + (Number(item.not_passed_count) || 0),
    0
  );
  const barData = {
    labels: labels,
    datasets: [
      {
        data: passedCounts, // ✅ จำนวนเด็กที่ผ่าน
        color: (opacity = 1) => `rgba(72, 191, 227, ${opacity})`, // สีฟ้า
      },
      {
        data: notPassedCounts, // ✅ จำนวนเด็กที่ไม่ผ่าน
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // สีแดง
      },
    ],
  };

  // ตรวจสอบว่ามีข้อมูลก่อนทำการประมวลผล
  const groupedData = dashboardData?.data
    ? dashboardData.data.reduce((acc, item) => {
        if (!acc[item.aspect]) acc[item.aspect] = [];
        acc[item.aspect].push(item);
        return acc;
      }, {} as Record<string, any[]>)
    : {}; // ✅ ป้องกัน undefined

  // return
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollviewALL}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.graphWrapper}>
          {Object.entries(groupedData).map(([aspect, data], index) => {
            const labels = data.map((item) => item.age_range);
            const passedCounts = data.map((item) => item.passed_count);
            const notPassedCounts = data.map((item) => item.not_passed_count);

            return (
              <View key={index} style={styles.graphContainer}>
                <Text style={styles.chartTitle}>{aspect}</Text>
                <BarChart
                  data={{
                    labels: labels,
                    datasets: [
                      {
                        data: passedCounts,
                        color: (opacity = 1) =>
                          `rgba(72, 191, 227, ${opacity})`, // สีฟ้า (ผ่าน)
                      },
                      {
                        data: notPassedCounts,
                        color: (opacity = 1) =>
                          `rgba(255, 107, 107, ${opacity})`, // สีแดง (ไม่ผ่าน)
                      },
                    ],
                  }}
                  width={screenWidth - 100}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundGradientFrom: "#f0f0f0",
                    backgroundGradientTo: "#f0f0f0",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    barPercentage: 0.8,
                  }}
                  fromZero
                  showBarTops={true}
                  showValuesOnTopOfBars
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Image
            source={require("../../../assets/icons/back.png")}
            style={styles.Icon}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollviewALL: {
    flex: 1,
    backgroundColor: "fff",
    maxHeight: "75%",
    borderRadius: 5,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "100%",
    height: 45,
    minHeight: 0,
    paddingLeft: 120,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    left: 20,
    padding: 8,
    borderRadius: 30,
    width: 100,
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  graphWrapper: {
    flexDirection: "column", // ✅ กราฟเรียงแนวตั้ง
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  graphContainer: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10, // ✅ เพิ่มระยะห่างระหว่างกราฟ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  Icon: {
    width: 30,
    height: 30,
  },
});
