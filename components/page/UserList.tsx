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
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingScreenBaby } from "../LoadingScreen";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Define API URL
import { API_ENDPOINT, API_DELETEUSER, API_USERLIST } from "@env";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// กำหนด interface
export interface Users {
  user_id: number;
  userName: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
  role: string;
  create_at: string;
}

export const UserList: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [users, setUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // fetchUserList
  const fetchUserList = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      // const token = await AsyncStorage.getItem("userToken");

      if (!userId) {
        console.error("User ID is missing.");
        return;
      }

      setIsLoading(true);
      const response = await fetch(
        `${API_ENDPOINT}/${API_USERLIST}/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();

        if (jsonResponse.users) {
          const updatedUsers: Users[] = jsonResponse.users.map(
            (users: Users) => {
              const imageUrl = `${API_ENDPOINT}/${users.profilePic}`;
              return {
                ...users,
                profilePic: imageUrl,
              };
            }
          );

          setTimeout(() => {
            setUsers(updatedUsers);
            setIsLoading(false);
          }, 100); // set delay
        } else {
          console.log("No children found.");
          setUsers([]);
          setIsLoading(false);
        }
      } else {
        console.error(
          `Error fetching data: ${response.status} ${response.statusText}`
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching child data:", error);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserList();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserList();
    setRefreshing(false);
  };

  //================================================================================================
  // ============ Delete User Function ============
  const handleDeleteAccount = async (user_id: number) => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    try {
      const response = await fetch(`${API_DELETEUSER}/${user_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-refresh-token": refreshToken ?? "",
        },
      });

      const result = await response.json();
      console.log("Delete Response:", result);

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("ลบสำเร็จ", "ข้อมูลบัญชีถูกลบแล้ว", [
          {
            text: "ตกลง",
            onPress: () => fetchUserList(),
          },
        ]);
      } else {
        Alert.alert("ลบไม่สำเร็จ", result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting child:", error);
      Alert.alert("ลบไม่สำเร็จ", "เกิดข้อผิดพลาดในการลบบัญชี โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  //================================================================================================
  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  const whenGotoHome = () => {
    navigation.navigate("mainAD");
  };

  const whenGotoUserEdit = (user: Users) => {
    navigation.navigate("userEdit", { user });
  };

  //================================================================================================
  // ฟิลเตอร์ข้อมูลตามค่าที่ค้นหา
  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // === ( LoadingScreen ) ===
  // if (isLoading) {
  //   return <LoadingScreenBaby />;
  // }

  //================================================================================================
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg2.png")}
        style={styles.background}
      >
        <Text style={styles.header}>User List</Text>

        {/* Search Section */}
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาผู้ใช้..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* User Card Section */}
        <View style={styles.midSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredUsers.length === 0
              ? users.map((users) => (
                  <LinearGradient
                    key={users.user_id}
                    colors={["#EAE0FF", "#D6C2FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.profileCardBoy}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        // borderWidth: 2,
                      }}
                    >
                      <Image
                        source={
                          users.profilePic
                            ? { uri: users.profilePic }
                            : require("../../assets/icons/User_Icon.png")
                        }
                        style={styles.profileIcon}
                      />

                      <View style={styles.profileInfo}>
                        <View style={styles.detailsName}>
                          <Text style={styles.profileName}>
                            {users.userName}
                          </Text>
                        </View>
                        <View style={styles.detailsAge}>
                          <Text style={styles.profileAge}>{users.email}</Text>
                        </View>
                        <View style={styles.detailsAge}>
                          <Text style={styles.profileAge}>
                            {users.phoneNumber}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.buttonDeleteOrEdit}>
                      {/* <Pressable
                        key={users.user_id}
                        style={styles.buttonEdit}
                        onPress={() => whenGotoUserEdit(users)}
                      >
                        <Text>แก้ไข</Text>
                      </Pressable> */}
                      <Pressable style={styles.buttonDelete}>
                        <Text>ลบ</Text>
                      </Pressable>
                    </View>
                  </LinearGradient>
                ))
              : filteredUsers.map((users) => (
                  <LinearGradient
                    key={users.user_id}
                    colors={["#EAE0FF", "#D6C2FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.profileCardBoy}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        // borderWidth: 2,
                      }}
                    >
                      <Image
                        source={
                          users.profilePic
                            ? { uri: users.profilePic }
                            : require("../../assets/icons/User_Icon.png")
                        }
                        style={styles.profileIcon}
                      />

                      <View style={styles.profileInfo}>
                        <View style={styles.detailsName}>
                          <Text style={styles.profileName}>
                            {users.userName}
                          </Text>
                        </View>
                        <View style={styles.detailsAge}>
                          <Text style={styles.profileAge}>{users.email}</Text>
                        </View>
                        <View style={styles.detailsAge}>
                          <Text style={styles.profileAge}>
                            {users.phoneNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.buttonDeleteOrEdit}>
                      {/* <Pressable
                        key={users.user_id}
                        style={styles.buttonEdit}
                        onPress={() => whenGotoUserEdit(users)}
                      >
                        <Text>แก้ไข</Text>
                      </Pressable> */}
                      <Pressable
                        style={styles.buttonDelete}
                        onPress={() => {
                          setSelectedUserId(users.user_id);
                          setSelectedUserName(users.userName);
                          setModalVisible(true);
                        }}
                      >
                        <Text>ลบ</Text>
                      </Pressable>
                    </View>
                  </LinearGradient>
                ))}
          </ScrollView>
          {/* Popup Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>
                  {`คุณต้องการลบข้อมูลของ\n`}
                  <Text style={{ color: "red", fontWeight: "bold" }}>
                    {selectedUserName}
                  </Text>{" "}
                  หรือไม่?
                </Text>
                <Text style={styles.modaltitleText}>
                  ข้อมูลผู้ใช้คนนี้จะถูกลบออกจากระบบ
                </Text>

                <View style={styles.modalButtonContainer}>
                  {/* ปุ่มยืนยันลบ */}
                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      if (selectedUserId !== null) {
                        handleDeleteAccount(selectedUserId);
                        setModalVisible(false);
                      } else {
                        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบผู้ใช้ได้");
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>ยืนยัน</Text>
                  </Pressable>
                  {/* ปุ่มยกเลิก */}
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>ยกเลิก</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={whenGotoHome}>
              <Image
                source={require("../../assets/icons/home.png")}
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
    marginTop: 55,
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
    // flexDirection: "row",
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
  // Button Delete or Edit
  buttonDeleteOrEdit: {
    marginTop: 5,
    flexDirection: "row",
    width: "100%",
    height: "auto",
    alignItems: "center",
    // justifyContent: "space-between", // This when have 2 button
    justifyContent: "center", // This when have 1 button
    paddingHorizontal: "10%",
    // borderWidth: 2,
  },
  buttonDelete: {
    backgroundColor: "#FFB6B6",
    width: "45%",
    height: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonEdit: {
    backgroundColor: "#CAEEE1",
    width: "45%",
    height: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  //
  searchInput: {
    width: "90%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  //
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
  },
  modalContainer: {
    width: 300,
    padding: 20,
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
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FFB6B6",
  },
  confirmButton: {
    backgroundColor: "#CAEEE1",
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
  },
});
