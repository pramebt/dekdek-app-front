import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Child, calculateAge, Room } from "../../../components/page/SP/HomeSP";
type ChooseChildSPRountprop = RouteProp<
  { assessment: { rooms: Room } },
  "assessment"
>;

// Define API URL
import { API_ENDPOINT, API_GET_CHILD_OF_ROOM } from "@env";

export const ChooseChildSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]);
  const route = useRoute<ChooseChildSPRountprop>();
  const { rooms } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const colorGradients: { [key: string]: [string, string, ...string[]] } = {
    "#FFA2C4": ["#FFE3ED", "#FFC9DD"], // pink
    "#F9C167": ["#FFF8EC", "#FFE0AE"], // yellow
    "#8DD9BD": ["#EAFFF7", "#C9F3E4"], // low green
    "#98D4FF": ["#EAF6FF", "#B7E1FF"], // low blue
    "#B695F8": ["#EAE0FF", "#D6C2FF"], // purple
  };

  const colorGradientsDetail: { [key: string]: [string, string] } = {
    "#FFA2C4": ["#FFA2C4", "#FFA2C4"], // pink
    "#F9C167": ["#F9C167", "#F9C167"], // yellow
    "#8DD9BD": ["#8DD9BD", "#8DD9BD"], // low green
    "#98D4FF": ["#98D4FF", "#98D4FF"], // low blue
    "#B695F8": ["#B695F8", "#B695F8"], // purple
  };

  const defaultGradient: [string, string] = ["#c5e5fc", "#ffffff"]; // ถ้าไม่มีใช้สีเริ่มต้น
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildDataForParent = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!supervisor_id) {
            console.error("Supervisor ID is missing.");
            return;
          }

          const response = await fetch(
            `${API_ENDPOINT}/${API_GET_CHILD_OF_ROOM}?supervisor_id=${supervisor_id}&rooms_id=${rooms.rooms_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();
            console.log("json response", jsonResponse);
            console.log("child response", jsonResponse.roomData.children);

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
              setChildren(updatedChildren);

              // const allAssessments = jsonResponse.children.map(
              //   (child: any) => child.assessments || []
              // );
            } else {
              console.log("No children found.");
              setChildren([]);
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

      fetchChildDataForParent();
    }, [])
  );

  const whenGotoAddChildSP = (rooms: Room) => {
    navigation.navigate("addchildSP", { rooms });
  };

  const whenGotoChildDetailSP = (child: Child) => {
    setModalVisible(false);
    navigation.navigate("childdetailsp", { child });
  };

  const whenGotoDetailPRforSP = (child: Child) => {
    setModalVisible(false);
    navigation.navigate("childdetailprforsp", { child });
  };

  const whenGotoAspectSP = (child: Child) => {
    navigation.navigate("aspectsp", { child });
  };

  const whenGotoEditRoom = (rooms: Room) => {
    navigation.navigate("editroom", { rooms });
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
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.topSection}>
            <LinearGradient
              colors={colorGradients[rooms.colors] || defaultGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <Image
                source={{ uri: rooms.roomsPic }}
                style={styles.profileIcon}
              />
              <View style={styles.profileInfo}>
                <View style={styles.detailsName}>
                  <Text style={styles.profileName}>{rooms.rooms_name}</Text>
                </View>
                <View style={styles.detailsAge}>
                  <Text style={styles.profileAge}>{rooms.child_count} คน</Text>
                </View>
                <TouchableOpacity onPress={() => whenGotoEditRoom(rooms)}>
                  <LinearGradient
                    colors={
                      colorGradientsDetail[rooms.colors] || defaultGradient
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.editroom}
                  >
                    <Text style={styles.editroomtext}>แก้ไขห้องเรียน</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.header}>เลือกเด็กที่ต้องการประเมิน</Text>
          {/* Profile Card Section */}
          <View style={styles.midSection}>
            <Pressable onPress={() => whenGotoAddChildSP(rooms)}>
              <LinearGradient
                colors={["#CEC9FF", "#F5E5FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 2 }}
                style={styles.addchildsp}
              >
                <Image
                  source={require("../../../assets/icons/addchild.png")}
                  style={styles.addchildIcon}
                />
              </LinearGradient>
            </Pressable>
            <ScrollView
              style={styles.ScrollView}
              contentContainerStyle={styles.scrollContent} // กำหนดการจัดเรียงเนื้อหา
              showsVerticalScrollIndicator={false}
            >
              {children.map((child) => (
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
                    onPress={() => whenGotoAspectSP(child)}
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
                      <TouchableOpacity
                        key={child.child_id}
                        style={
                          child.gender === "male"
                            ? styles.detailsButtonBoy
                            : styles.detailsButtonGirl
                        }
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Popup Modal */}
                    {/* Popup Modal Choose Last Result */}
                    <Modal
                      animationType="fade"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => setModalVisible(false)}
                    >
                      <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                          <Text style={styles.modalText}>
                            เลือกรายละเอียดที่ต้องการดู
                          </Text>

                          <View style={styles.modalButtonContainer}>
                            {/* Result Supervisor */}
                            <Pressable
                              onPress={() => whenGotoChildDetailSP(child)}
                              style={{ width: "100%" }}
                            >
                              <LinearGradient
                                colors={["#8DD9BD", "#CAEEE1"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                  styles.modalButton,
                                  styles.confirmButton,
                                ]}
                              >
                                <Text style={styles.buttonText}>
                                  ผลการประเมินของผู้ดูแล
                                </Text>
                              </LinearGradient>
                            </Pressable>
                            {/* Result Parent */}
                            <Pressable
                              onPress={() => whenGotoDetailPRforSP(child)}
                              style={{ width: "100%" }}
                            >
                              <LinearGradient
                                colors={["#8DD9BD", "#CAEEE1"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                  styles.modalButton,
                                  styles.confirmButton,
                                ]}
                              >
                                <Text style={styles.buttonText}>
                                  ผลการประเมินของผู้ปกครอง
                                </Text>
                              </LinearGradient>
                            </Pressable>
                            {/* Cancel */}
                            <Pressable
                              style={[styles.modalButton, styles.cancelButton]}
                              onPress={() => setModalVisible(false)}
                            >
                              <Text style={styles.cancelbuttonText}>
                                ยกเลิก
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
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
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
    // borderWidth: 2,
  },
  topSection: {
    width: "auto",
    paddingTop: "8%",
    alignItems: "center",
    // borderWidth: 2,
  },
  ScrollView: {
    // flex: 1,
    width: "auto",
    borderRadius: 20,
    marginTop: 10,
    // borderWidth: 2,
  },
  scrollContent: {
    width: "95%",
    paddingBottom: 20,
    // borderWidth: 2,
  },
  midSection: {
    width: "auto",
    alignItems: "center",
    // borderWidth: 2,
  },
  bottomSection: {
    width: "90%",
    marginBottom: "5%",
    bottom: 0,
    position: "absolute",
    alignItems: "center",
    // borderWidth: 2,
  },
  header: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileCard: {
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  profileCardGirl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: "auto",
    marginTop: 15,
  },
  profileCardBoy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: "auto",
    marginTop: 15,
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
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  addchildsp: {
    marginTop: 15,
    width: 350,
    paddingVertical: 7,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#646464",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
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
    borderRadius: 30,
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
    borderRadius: 30,
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
    flexDirection: "row",
    width: "50%",
    alignItems: "center",
    // borderWidth: 2,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "100%",
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
  editroom: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#817CD1",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 30,
    alignItems: "center",
  },
  editroomtext: {
    fontSize: 14,
    color: "#000",
  },

  // ----------------------------------------------------------------------------------
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
  },
  modalContainer: {
    width: 300,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    flexGrow: 1,
    // justifyContent: "center",
    alignItems: "center",
    // justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    // flexGrow: 1,
    width: "100%",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
    // marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FFB6B6",
    width: "50%",
  },
  confirmButton: {
    backgroundColor: "#CAEEE1",
  },
  buttonText: {
    color: "#3A3A3A",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelbuttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
