import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Room } from "../../../components/page/SP/HomeSP";
import { LinearGradient } from "expo-linear-gradient";

// Define API URL
import { API_ENDPOINT, API_GET_ROOM_DATA } from "@env";

export const ChooseRoom: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [rooms, setRoom] = useState<Room[]>([]);

  const colorGradients: { [key: string]: [string, string, ...string[]] } = {
    "#FFA2C4": ["#FFE3ED", "#FFC9DD"], // pink
    "#F9C167": ["#FFF8EC", "#FFE0AE"], // yellow
    "#8DD9BD": ["#EAFFF7", "#C9F3E4"], // low green
    "#98D4FF": ["#EAF6FF", "#B7E1FF"], // low blue
    "#B695F8": ["#EAE0FF", "#D6C2FF"], // purple
  };
  const defaultGradient: [string, string] = ["#c5e5fc", "#ffffff"];

  useFocusEffect(
    React.useCallback(() => {
      const fetchRoomDataForSupervisor = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!supervisor_id) {
            console.error("supervisor ID is missing.");
            return;
          }

          const response = await fetch(
            `${API_ENDPOINT}/${API_GET_ROOM_DATA}?supervisor_id=${supervisor_id}`,
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
            console.log("📡 API Response:", jsonResponse);

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
              console.log("No rooms found.");
              setRoom([]);
            }
          } else {
            console.error(
              `Error fetching data: ${response.status} ${response.statusText}`
            );
          }
        } catch (error) {
          console.error("Error fetching child data:", error);
        }
      };

      fetchRoomDataForSupervisor();
    }, [])
  );

  const whenGotoDetail = (id: number) => {
    navigation.navigate("detail", { id });
  };
  const whengotoChooseChildSP = (rooms: Room) => {
    navigation.navigate("choosechildsp", { rooms });
  };
  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <ImageBackground
      source={require("../../../assets/background/bg2.png")}
      style={styles.background}
    >
      <Text style={styles.header}>เลือกห้องที่ต้องการประเมิน</Text>
      {/* Profile Card Section */}
      <View style={styles.midSection}>
        <ScrollView
          style={styles.ScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rooms.length === 0 ? (
            <View style={styles.profileCardIntro}>
              <Image
                source={require("../../../assets/icons/User_Icon.png")}
                style={styles.profileIcon}
              />
              <View style={styles.profileInfo}>
                <View style={styles.IntroContainer}>
                  <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                </View>
                <Pressable style={styles.detailButtonIntro}>
                  <Text style={styles.detailTextIntro}>
                    เพิ่มข้อมูลเด็กที่นี่
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            rooms.map((rooms) => (
              <Pressable
                key={rooms.rooms_id}
                onPress={() => whengotoChooseChildSP(rooms)}
              >
                <LinearGradient
                  colors={colorGradients[rooms.colors] ?? defaultGradient}
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
                      <Text style={styles.profileName}>{rooms.rooms_name}</Text>
                    </View>
                    <View style={styles.detailsAge}>
                      <Text style={styles.profileAge}>
                        {rooms.child_count} คน
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
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
    flex: 1, // ใช้พื้นที่ทั้งหมด
    width: "100%", // ให้เต็มความกว้างของหน้าจอ
    // borderWidth: 2,
    borderRadius: 20,
  },
  scrollContent: {
    alignItems: "center", // จัดเนื้อหาใน ScrollView ให้อยู่กึ่งกลางแนวนอน
    paddingBottom: 20, // เพิ่มพื้นที่ด้านล่าง
  },
  midSection: {
    height: "70%",
    width: "100%",
    justifyContent: "center", // จัดกึ่งกลางแนวตั้ง
    alignItems: "center", // จัดกึ่งกลางแนวนอน,
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

  CardRoom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // จัดเนื้อหาภายในการ์ดให้อยู่กึ่งกลาง

    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 330, // ใช้ความกว้างแบบยืดหยุ่น
    marginTop: 15,
    height: 120,
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
    fontWeight: "bold",
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
  buttonContainer: {
    //position: "absolute",
    flexDirection: "row", // จัดปุ่มให้อยู่ในแถวเดียวกัน
    //justifyContent: "space-around", // จัดปุ่มให้มีระยะห่างเท่ากัน
    paddingHorizontal: 20, // ระยะห่างด้านข้างของปุ่ม
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
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 350,
    height: 130,
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 18,
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
});
