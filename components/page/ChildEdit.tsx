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
const AddChildSchema = z.object({
  firstName: z.string().min(4, "กรุณาระบุชื่อเด็ก").max(150),
  lastName: z.string().min(4, "กรุณาระบุนามสกุลเด็ก").max(150),
  nickName: z.string().min(2, "กรุณาระบุชื่อเล่นเด็ก").max(150),
  birthday: z.string({
    required_error: "กรุณาระบุวันเกิดเด็ก",
    invalid_type_error: "รูปแบบวันเกิดไม่ถูกต้อง",
  }),
  gender: z.enum(["male", "female"]),
  childPic: z.string().optional(),
});

// Type Definitions
type AddChildModel = z.infer<typeof AddChildSchema>;

import { Child } from "./ChildList";
import { SafeAreaProvider } from "react-native-safe-area-context";
type ChildRouteProp = RouteProp<{ childList: { child: Child } }, "childList">;

// Define API URL
import { API_ENDPOINT, API_DELETECHILD, API_UPDATECHILD } from "@env";

export const ChildEdit: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<AddChildModel>({
    resolver: zodResolver(AddChildSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();

  const Childroute = useRoute<ChildRouteProp>();
  const { child } = Childroute.params;

  // 🔹 State สำหรับข้อมูลเด็ก
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0]; // ตัดให้เหลือ YYYY-MM-DD
  };
  const [selectedDate, setSelectedDate] = useState<string | null>(
    child.birthday ? formatDate(child.birthday) : null
  );
  const [date, setDate] = useState<Date>(
    child.birthday ? new Date(child.birthday) : new Date()
  );

  const [childPic, setChildPic] = useState<string | null>(
    child.childPic || null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    if (child) {
      setValue("firstName", child.firstName || "");
      setValue("lastName", child.lastName || "");
      setValue("nickName", child.nickName || "");
      setValue("birthday", child.birthday || "");
      setValue(
        "gender",
        child.gender === "male" || child.gender === "female"
          ? child.gender
          : "male"
      );
    }
    if (child.birthday) {
      setSelectedDate(formatDate(child.birthday)); // ตัดให้เหลือ YYYY-MM-DD
      setDate(new Date(child.birthday));
    }
  }, [child, setValue, child.birthday]);

  // ฟังก์ชันการจัดการการยืนยันวันที่
  const handleConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);

    // แปลงวันที่จาก Gregorian เป็น Buddhist Era (เพิ่ม 543 ปี)
    const thaiYear = selectedDate.getFullYear() + 543;

    // ใช้ format จาก date-fns
    const formattedDate = format(selectedDate, "dd-MM-") + thaiYear; // เก็บปีในรูปแบบ BE

    setSelectedDate(formattedDate); // เก็บวันที่ที่แปลงแล้วใน state
    setDate(selectedDate); // เก็บ Date object
    setValue("birthday", selectedDate.toISOString()); // ส่งค่าไปยัง react-hook-form
  };

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
      setChildPic(selectedImageUri); // ✅ อัปเดต UI ให้แสดงรูปที่เลือกใหม่
      console.log("Selected Image URI:", selectedImageUri);
    }
  };

  // handleUpdate Child Profile
  const handleUpdate = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("userToken");

    console.log("user_id: ", userId);

    try {
      const formData = new FormData();

      // 📌 send child_id with FormData
      formData.append("child_id", child.child_id.toString());

      // 📌 ดึงค่าปัจจุบันจาก `useForm`
      const { firstName, lastName, nickName, birthday, gender } = getValues();

      // 📌 ดึงค่าดั้งเดิมจาก `child`
      const storeFirstName = child.firstName;
      const storeLastName = child.lastName;
      const storeNickName = child.nickName;
      const storeBirthday = child.birthday;
      const storeGender = child.gender;
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      // 📌 เช็คว่าเปลี่ยนแปลงหรือไม่ ก่อนเพิ่มลง FormData
      if (firstName && firstName !== storeFirstName) {
        formData.append("firstName", firstName);
      }

      if (lastName && lastName !== storeLastName) {
        formData.append("lastName", lastName);
      }

      if (nickName && nickName !== storeNickName) {
        formData.append("nickName", nickName);
      }

      if (birthday && birthday !== storeBirthday) {
        formData.append("birthday", birthday);
      }

      if (gender && gender !== storeGender) {
        formData.append("gender", gender);
      }

      // Append profile picture if available
      if (childPic) {
        const uri = childPic;
        const filename = uri.split("/").pop(); // Extract filename from URI
        const imageType = "image/jpeg"; // Assuming JPEG format
        formData.append("childPic", {
          uri: uri, // Ensure URI is valid
          name: filename,
          type: imageType,
        } as any);
      } else {
        console.log("No childPic provided");
      }

      // 📌 ตรวจสอบว่ามีการเปลี่ยนแปลงข้อมูลหรือไม่
      if (formData.entries().next().done) {
        Alert.alert("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลก่อนกดบันทึก");
        return;
      }

      // 📌 ส่งข้อมูลไปยัง Backend
      const response = await fetch(`${API_ENDPOINT}/${API_UPDATECHILD}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-refresh-token": refreshToken ?? "",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Response from update:", result);

      if (response.ok && result.success) {
        Alert.alert("สำเร็จ", "อัปเดตข้อมูลเด็กเรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => navigation.navigate("childList") },
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
  // ============ Delete Child Function ============
  const handleDeleteChild = async (child_id: number) => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    try {
      const response = await fetch(
        `${API_ENDPOINT}/${API_DELETECHILD}/${child_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-refresh-token": refreshToken ?? "",
          },
        }
      );

      const result = await response.json();
      console.log("Delete Response:", result);

      if (response.ok) {
        setModalVisible(false);
        Alert.alert("ลบสำเร็จ", "ข้อมูลเด็กถูกลบออกจากระบบแล้ว", [
          {
            text: "ตกลง",
            onPress: () => navigation.navigate("childList"),
          },
        ]);
      } else {
        Alert.alert("ลบไม่สำเร็จ", result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting child:", error);
      Alert.alert("ลบไม่สำเร็จ", "เกิดข้อผิดพลาดขณะลบข้อมูลเด็ก");
    } finally {
      setIsLoading(false);
    }
  };

  //================================================================================================
  // ============ whenGoto Function ============
  const goBack = () => {
    navigation.goBack();
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
                  {childPic ? (
                    <Image source={{ uri: childPic }} style={styles.avatar} />
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
                  {/* FirstName */}
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.firstName && styles.errorInput,
                        ]}
                        placeholder="ชื่อเด็ก"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange} // ✅ ใช้ `onChange` ของ react-hook-form
                        value={value} // ✅ ค่าเริ่มต้นจะถูกโหลดจาก `child.firstName`
                      />
                    )}
                  />

                  {/* LastName */}
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.lastName && styles.errorInput,
                        ]}
                        placeholder="นามสกุลเด็ก"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange}
                        value={value} // ✅ ค่าเริ่มต้นจะถูกโหลดจาก `child.lastName`
                      />
                    )}
                  />

                  {/* NickName */}
                  <Controller
                    control={control}
                    name="nickName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.nickName && styles.errorInput,
                        ]}
                        placeholder="ชื่อเล่นเด็ก"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />

                  {/* DatePicker */}
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.inputText,
                        !selectedDate && styles.placeholderText,
                        // errors.birthday && styles.errorInput,
                      ]}
                    >
                      {selectedDate ? selectedDate : "วันเกิดเด็ก"}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS === "ios" && showDatePicker && (
                    <Modal
                      transparent={true}
                      animationType="slide"
                      visible={showDatePicker}
                    >
                      <View style={styles.modalBackground}>
                        <View style={styles.pickerContainer}>
                          <DateTimePicker
                            value={date}
                            mode="date"
                            display="spinner"
                            minimumDate={
                              new Date(
                                new Date().setFullYear(
                                  new Date().getFullYear() - 6,
                                  new Date().getMonth() - 6
                                )
                              )
                            }
                            maximumDate={new Date()}
                            onChange={(event, newDate) => {
                              if (newDate) {
                                setDate(newDate);
                                // handleConfirm(newDate);
                              }
                            }}
                            textColor="black"
                            themeVariant="light"
                            locale="th"
                          />
                          <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={styles.buttonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.confirmButton}
                              onPress={() => {
                                handleConfirm(date);
                                setShowDatePicker(false);
                              }}
                            >
                              <Text style={styles.buttonText}>ยืนยัน</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  )}

                  {Platform.OS === "android" && showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="calendar"
                      minimumDate={
                        new Date(
                          new Date().setFullYear(
                            new Date().getFullYear() - 6,
                            new Date().getMonth() - 6
                          )
                        )
                      }
                      maximumDate={new Date()}
                      onChange={(event, newDate) => {
                        setShowDatePicker(false);
                        if (newDate) {
                          handleConfirm(newDate);
                        }
                      }}
                    />
                  )}

                  {errors.birthday && (
                    <Text style={styles.errorText}>กรุณาระบุวันเกิดเด็ก</Text>
                  )}

                  <Text style={styles.label}>เพศ</Text>
                  <View style={styles.genderContainer}>
                    <Controller
                      control={control}
                      name="gender"
                      rules={{ required: "กรุณาเลือกเพศ" }}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.genderOptions}>
                          <TouchableOpacity
                            onPress={() => onChange("male")}
                            style={styles.genderOption}
                          >
                            <View
                              style={
                                value === "male"
                                  ? styles.radioSelected
                                  : styles.radio
                              } // ✅ กำหนดจุดเขียวตามค่า gender
                            />
                            <Text>ชาย</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => onChange("female")}
                            style={styles.genderOption}
                          >
                            <View
                              style={
                                value === "female"
                                  ? styles.radioSelected
                                  : styles.radio
                              } // ✅ กำหนดจุดเขียวตามค่า gender
                            />
                            <Text>หญิง</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>
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
              <Pressable
                //onPress={whenGotoAssessment}
                onPress={handleSubmit(handleUpdate)}
                style={styles.submitButton}
              >
                <Text style={styles.buttonText}>บันทึก</Text>
              </Pressable>
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
                    {/* ปุ่มยกเลิก */}
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>ยกเลิก</Text>
                    </Pressable>

                    {/* ปุ่มยืนยันลบ */}
                    <Pressable
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={() => handleDeleteChild(child.child_id)}
                    >
                      <Text style={styles.buttonText}>ยืนยัน</Text>
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
