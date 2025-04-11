import React, { FC, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  ImageBackground,
  Keyboard,
  Modal,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from "react-native-date-picker";
import { LinearGradient } from "expo-linear-gradient";

// Form validation schema
const UsersSchema = z.object({
  userName: z
    .string()
    .min(5, "กรุณาระบุชื่อผู้ใช้ที่มีความยาวอย่างน้อย 5 ตัวอักษร")
    .max(150),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .max(25),
  phoneNumber: z
    .string()
    .min(10, "หมายเลขโทรศัพท์ต้องมีความยาวอย่างน้อย 10 ตัวอักษร")
    .max(15)
    .regex(/^[0-9]+$/, "หมายเลขโทรศัพท์ต้องประกอบด้วยตัวเลขเท่านั้น"),
  role: z.enum(["parent", "supervisor", "admin"], {
    errorMap: () => ({ message: "กรุณาเลือกบทบาท" }), // ข้อความผิดพลาดที่กำหนดเอง
  }),
  agree: z.boolean().default(false),
  profilePic: z.string().optional(),
});

// Type Definitions
type UsersModel = z.infer<typeof UsersSchema>;

import { Users } from "./UserList";
import { SafeAreaProvider } from "react-native-safe-area-context";
type UsersRouteProp = RouteProp<{ userList: { user: Users } }, "userList">;

// Define API URL
import { API_ENDPOINT, API_UPDATEUSER, API_DELETEUSER } from "@env";

export const UserEdit: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<UsersModel>({
    resolver: zodResolver(UsersSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();
  const Usersroute = useRoute<UsersRouteProp>();
  const { user } = Usersroute.params;

  // 🔹 State สำหรับข้อมูล user
  const [profilePic, setProfilePic] = useState<string | null>(
    user.profilePic || null
  );
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    if (user) {
      setValue("userName", user.userName || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user, setValue]);

  // ฟังก์ชันขออนุญาต
  const requestPermission = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "You need to grant permission to access the media library."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert(
        "Permission Error",
        "An error occurred while requesting permissions."
      );
      return false;
    }
  };

  // ฟังก์ชันเลือกภาพ
  const selectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      try {
        // สร้างโฟลเดอร์หากยังไม่มี
        const imgDir = FileSystem.documentDirectory + "images/";
        const folderInfo = await FileSystem.getInfoAsync(imgDir);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
        }

        // บันทึกรูปภาพลงในเครื่อง
        const filename = new Date().getTime() + ".jpeg";
        const dest = imgDir + filename;
        await FileSystem.copyAsync({ from: selectedImageUri, to: dest });
        setProfilePic(dest); // ตั้ง path ของภาพที่บันทึกไว้ใน state
        console.log("Selected and saved Image URI:", dest);
      } catch (error) {
        console.error("Error saving image:", error);
        Alert.alert("Error", "An error occurred while saving the image.");
      }
    }
  };

  // handleUpdate User Profile
  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const formData = new FormData();

      // 📌 send user_id with FormData
      formData.append("user_id", String(user.user_id));

      // 📌 ดึงค่าปัจจุบันจาก `useForm`
      const { userName, email, phoneNumber } = getValues();

      // 📌 ดึงค่าดั้งเดิมจาก `user`
      const storedUserName = user.userName;
      const storedEmail = user.email;
      const storedPhoneNumber = user.phoneNumber;
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      // 📌 เช็คว่าเปลี่ยนแปลงหรือไม่ ก่อนเพิ่มลง FormData
      if (userName && userName !== storedUserName) {
        formData.append("userName", userName);
      }

      if (email && email !== storedEmail) {
        formData.append("email", email);
      }

      if (phoneNumber && phoneNumber !== storedPhoneNumber) {
        formData.append("phoneNumber", phoneNumber);
      }

      // Append profile picture if available
      if (profilePic) {
        const uri = profilePic;
        const filename = uri.split("/").pop(); // Extract filename from URI
        const imageType = "image/jpeg"; // Assuming JPEG format
        formData.append("profilePic", {
          uri: uri, // Ensure URI is valid
          name: filename,
          type: imageType,
        } as any);
      } else {
        console.log("No profilePic provided");
      }

      // 📌 ตรวจสอบว่ามีการเปลี่ยนแปลงข้อมูลหรือไม่
      if (formData.entries().next().done) {
        Alert.alert("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลก่อนกดบันทึก");
        return;
      }

      // 📌 ส่งข้อมูลไปยัง Backend
      const response = await fetch(`${API_ENDPOINT}/${API_UPDATEUSER}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // "x-refresh-token": refreshToken ?? "",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Response from update:", result);

      if (response.ok && result.success) {
        Alert.alert("สำเร็จ", "อัปเดตข้อมูลเด็กเรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => navigation.navigate("userList") },
        ]);
      } else {
        Alert.alert("เกิดข้อผิดพลาด", result.message || "ไม่สามารถอัปเดตได้");
      }
    } catch (error) {
      console.error("Error updating child profile:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดระหว่างการอัปเดตข้อมูล");
    }
  };

  //================================================================================================
  // ============ Delete User Function ============
  const handleDeleteAccount = async (user_id: number) => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    try {
      const response = await fetch(
        `${API_ENDPOINT}/${API_DELETEUSER}/${user_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken ?? "",
          },
        }
      );

      const result = await response.json();
      console.log("Delete Response:", result);

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("ลบสำเร็จ", "ข้อมูลบัญชีถูกลบแล้ว", [
          {
            text: "ตกลง",
            onPress: () => navigation.navigate("userList"),
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
  // ============ whenGoto Function ============
  const goBack = () => {
    navigation.goBack();
  };

  const whenGotoHome = () => {
    navigation.navigate("mainAD");
  };
  //================================================================================================
  // return
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaProvider>
          <ImageBackground
            source={require("../../assets/background/bg2.png")}
            style={styles.background}
          >
            {/* Top Section */}
            <Text style={styles.HeaderText}>แก้ไขข้อมูลเด็ก</Text>

            {/* Mid Section */}
            <View style={styles.Inputcontainer}>
              <View style={styles.avatarContainer}>
                {/* placeholder of Picture */}
                <View style={styles.avtarFrame}>
                  {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.avatar} />
                  ) : (
                    <Image
                      source={require("../../assets/icons/userIcon.png")}
                      style={styles.avatar}
                    />
                  )}
                </View>
                <Pressable style={styles.addIconSection} onPress={selectImage}>
                  <Image
                    source={require("../../assets/icons/image-gallery.png")}
                    style={styles.addIcon}
                  />
                </Pressable>
              </View>
              <LinearGradient
                colors={["#E2F0E9", "#F1FFEC", "#ECFFF8"]}
                style={styles.container}
              >
                {/* Input Section */}
                <View style={styles.MiddleSection}>
                  {/* userName */}
                  <Controller
                    control={control}
                    name="userName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.userName && styles.errorInput,
                        ]}
                        placeholder="userName"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange} // ✅ ใช้ `onChange` ของ react-hook-form
                        value={value} // ✅ ค่าเริ่มต้นจะถูกโหลดจาก `user.userName`
                      />
                    )}
                  />

                  {/* email */}
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.email && styles.errorInput,
                        ]}
                        placeholder="Email"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                      />
                    )}
                  />

                  {/* phoneNumber */}
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.phoneNumber && styles.errorInput,
                        ]}
                        placeholder="Phone Number"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange}
                        value={value}
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Bottom Section */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={goBack}>
                <Image
                  source={require("../../assets/icons/back.png")}
                  style={styles.Icon}
                />
              </Pressable>
              <TouchableOpacity
                //onPress={whenGotoAssessment}
                onPress={handleUpdate}
                style={styles.submitButton}
              >
                <Text style={styles.buttonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>

            {/* ปุ่มลบเด็ก */}
            <Pressable
              style={styles.deleteChild}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={require("../../assets/icons/delete.png")}
                style={styles.deleteChildIcon}
                resizeMode="contain"
              />
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
                    คุณต้องการลบข้อมูลเด็กใช่หรือไม่?
                  </Text>
                  <Text style={styles.modaltitleText}>
                    เด็กจะถูกลบออกจากบัญชีของคุณ
                    รวมถึงบัญชีของผู้ดูแลที่เคยได้รับอนุญาตให้ใช้ข้อมูลด้วย
                  </Text>

                  <View style={styles.modalButtonContainer}>
                    {/* ปุ่มยืนยันลบ */}
                    <Pressable
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={() => handleDeleteAccount(user.user_id)}
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
          </ImageBackground>
        </SafeAreaProvider>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  MiddleSection: {
    // flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    padding: 10,
    // paddingTop: 50,
    //borderWidth:2,
  },
  SafeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 750,
  },
  Inputcontainer: {
    width: "90%",
    height: "65%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 6,
    marginTop: 60,
  },
  container: {
    // flex: 1,
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#eafff8",
    borderRadius: 25,
    padding: 20,
    //borderWidth: 2,
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    position: "absolute",
    top: 10,
  },

  input: {
    width: "100%",
    height: 50,
    borderColor: "#D9D9D9",
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  inputText: {
    left: 0,
    top: 15,
    //justifyContent: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  genderContainer: {
    alignContent: "center",
    alignItems: "center",
    //backgroundColor: "#000",
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    marginRight: 10,
  },

  deleteChild: {
    //borderWidth:1,
    width: 100,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#FF8E8E",
    position: "absolute",
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },

  deleteChildIcon: {
    width: "35%",
    marginLeft: 5,
  },

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
  confirmButtonCalender: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonCalender: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContainer: {
    position: "absolute",
    bottom: 140,
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "100%",
    height: 45,
    minHeight: 0,
    padding: 0,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
  },
  //
  avatarContainer: {
    position: "absolute",
    top: -50, // Adjust the top position to move it above the container
    zIndex: 1,
    // borderWidth: 3,
  },
  avtarFrame: {
    borderRadius: 50,
    //borderWidth: 2,
    backgroundColor: "#D9D9D9",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addIcon: {
    top: 4,
    width: 27,
    height: 27,
  },
  addIconSection: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 35,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: "#C5E5FC",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    left: 20,
    right: 50,
    padding: 8,
    borderRadius: 30,
    width: "25%",
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#cce9fe",
    left: 70,
    right: 20,
    padding: 10,
    borderRadius: 30,
    width: "50%",
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  Icon: {
    width: 30,
    height: 30,
  },
  errorInput: {
    borderColor: "red",
  },
  errorTextGender: {
    color: "red",
    fontSize: 12,
    top: 10,
    // marginBottom: 5,
    // left: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    top: -7,
    marginBottom: 5,
    left: 8,
  },
  HeaderText: {
    bottom: "3%",
    fontSize: 22,
    fontWeight: "bold",
  },
  OnInputText: {
    fontSize: 14,
    textAlign: "left",
    left: 8,
    marginBottom: 2,
  },
  Datepicker: {
    width: "100%",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  pickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  confirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  placeholderText: {
    color: "gray",
    fontStyle: "italic",
  },
});
