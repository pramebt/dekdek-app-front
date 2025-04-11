// Setting.tsx
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ImageBackground,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Define API URL
import { API_ENDPOINT, API_USERPIC, API_LOGOUT } from "@env";

export const Setting: FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedUserName = await AsyncStorage.getItem("userName");
          const storedProfilePic = await AsyncStorage.getItem("profilePic");

          if (storedUserName) setUserName(storedUserName);
          if (storedProfilePic) setProfilePic(storedProfilePic);

          await fetchUserProfilePic();
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };
      loadUserData();
    }, [])
  );

  const fetchUserProfilePic = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!userId) throw new Error("No user ID found");

      console.log("API URL:", API_ENDPOINT);
      console.log("API_LOGOUT:", API_LOGOUT);
      console.log("API_USERPIC:", API_USERPIC);

      const response = await fetch(
        `${API_ENDPOINT}/${API_USERPIC}?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken ?? "",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const jsonResponse = await response.json();

      if (jsonResponse.success && jsonResponse.profilePic) {
        const imageUrl = `${API_ENDPOINT}/${jsonResponse.profilePic}`;
        setProfilePic(imageUrl);
        await AsyncStorage.setItem("profilePic", imageUrl); // Cache รูปใหม่
      }
    } catch (error) {
      console.error("Failed to fetch profile picture:", error);
    }
  };

  const handleLogout = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    try {
      const response = await fetch(`${API_ENDPOINT}/${API_LOGOUT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          refreshToken,
        }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const jsonResponse = await response.json();
      console.log(jsonResponse);

      if (response.status === 200) {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("userRole");
        await AsyncStorage.removeItem("userId");
        await AsyncStorage.removeItem("profilePic");

        navigation.reset({
          index: 0,
          routes: [{ name: "welcome" }],
        });
      }
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while logging out");
    }
  };

  const whenGotoUpdateProfile = () => {
    navigation.navigate("updateprofile");
  };

  const whenGotoHowToUse = () => {
    navigation.navigate("howtouse");
  };

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg2.png")}
        style={styles.ImageBackground}
      >
        {/* <SafeAreaView style={{ flex: 1 }}> */}
        <View style={styles.container}>
          {/* Setting Section */}
          <View style={styles.sectionContainer}>
            {/* Profile Section */}
            <View style={styles.profileContainer}>
              <Image
                source={
                  profilePic
                    ? { uri: profilePic }
                    : require("../../assets/icons/User_Icon.png")
                }
                style={styles.avatar}
              />
            </View>

            {/* username Section */}
            <View style={styles.usernameSection}>
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{userName}</Text>
              </View>
            </View>
            {/* Account Section */}
            <View style={styles.AccountSection}>
              <Icon name="user" size={20} color="#000" />
              <Text style={styles.sectionTitle}>บัญชีของฉัน</Text>
            </View>
            <Pressable
              style={styles.sectionItem}
              onPress={whenGotoUpdateProfile}
            >
              <Text style={styles.sectionText}>รายละเอียดบัญชี</Text>
              <Icon name="chevron-right" size={15} color="#000" />
            </Pressable>
            {/* Support Section */}
            <View style={styles.SupportSection}>
              <AntDesign name="infocirlce" size={20} color="#000" />
              <Text style={styles.sectionTitle}>ส่วนสนับสนุน</Text>
            </View>
            <Pressable style={styles.sectionItem}>
              <Text style={styles.sectionText}>ศูนย์ช่วยเหลือ</Text>
              <Icon name="chevron-right" size={15} color="#000" />
            </Pressable>
            <Pressable style={styles.sectionItem}>
              <Text style={styles.sectionText}>นโยบาย</Text>
              <Icon name="chevron-right" size={15} color="#000" />
            </Pressable>
            <Pressable style={styles.sectionItem}>
              <Text style={styles.sectionText}>เกี่ยวกับเรา</Text>
              <Icon name="chevron-right" size={15} color="#000" />
            </Pressable>
            <Pressable style={styles.sectionItem} onPress={whenGotoHowToUse}>
              <Text style={styles.sectionText}>คู่มือการใช้งาน</Text>
              <Icon name="chevron-right" size={15} color="#000" />
            </Pressable>
            {/* Download Button */}
            {/* <Pressable style={styles.downloadButton}>
            <Text style={styles.downloadText}>ดาวน์โหลดข้อมูลการประเมิน</Text>
            <Icon name="download" size={20} color="#4CAF50" />
          </Pressable> */}
          </View>
        </View>
        {/* Logout Button */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </Pressable>
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
                คุณต้องการออกจากระบบใช่หรือไม่?
              </Text>
              <Text style={styles.modaltitleText}>
                เมื่อออกจากระบบ
                คุณต้องทำการเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานแอปพลิเคชัน
              </Text>

              <View style={styles.modalButtonContainer}>
                {/* ปุ่มยืนยันลบ */}
                <Pressable
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => handleLogout()}
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
        {/* </SafeAreaView> */}
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  ImageBackground: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    width: "100%",
    height: "80%",
    padding: 20,
    paddingTop: 50,
    // borderWidth: 3,
  },
  profileContainer: {
    position: "absolute",
    width: "40%",
    left: "36%",
    bottom: "95%",
    alignItems: "center",
    //borderWidth:1,
  },
  avatar: {
    width: "100%",
    height: 120,
    borderRadius: 100,
    backgroundColor: "#E5E7EB",
    //borderWidth:1,
  },
  usernameSection: {
    width: "100%",
    top: 50,
    alignItems: "center",
  },
  usernameContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 5,
    width: "65%",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginTop: 20,
    backgroundColor: "#e1eeff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    //alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    left: 10,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 3,
    backgroundColor: "#fff",
  },
  sectionText: {
    fontSize: 14,
  },
  // downloadButton: {
  //   width: "75%",
  //   flexDirection: "row",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginTop: 20,
  //   backgroundColor: "#fff",
  //   borderRadius: 10,
  //   paddingVertical: 10,
  //   left: 40,
  // },
  // downloadText: {
  //   color: "#000",
  //   marginRight: 10,
  //   fontSize: 14,
  //   fontWeight: "bold",
  // },

  logoutButton: {
    width: "50%",
    // marginTop: 15,
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: "#FF8C8C",
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    position: "absolute",
    bottom: 130,
    //borderWidth: 1,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  AccountSection: {
    flexDirection: "row",
    paddingTop: 67,
  },
  SupportSection: {
    flexDirection: "row",
    paddingTop: 15,
  },
  ChangeProfileName: {
    left: 100,
  },
  // ModalSection
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
