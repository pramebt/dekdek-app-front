import React, { FC, useState } from "react";
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
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from "react-native-date-picker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Form validation schema
const AddChildSchema = z.object({
  firstName: z.string().min(4, "กรุณาระบุชื่อเด็ก").max(150),
  lastName: z.string().min(4, "กรุณาระบุนามสกุลเด็ก").max(150),
  nickName: z.string().min(2, "กรุณาระบุชื่อเล่นเด็ก").max(150),
  birthday: z.date({
    required_error: "กรุณาระบุวันเกิดเด็ก",
    invalid_type_error: "รูปแบบวันเกิดไม่ถูกต้อง",
  }),
  gender: z.enum(["male", "female"]),
});

// Type Definitions
type AddChildModel = z.infer<typeof AddChildSchema>;

// Define API URL
import { API_ADD_CHILD_PARENT, API_ENDPOINT } from "@env";

export const AddChild: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddChildModel>({
    resolver: zodResolver(AddChildSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();

  const [childPic, setChildPic] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ฟังก์ชันการจัดการการยืนยันวันที่
  const handleConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);

    // แปลงวันที่จาก Gregorian เป็น Buddhist Era (เพิ่ม 543 ปี)
    const thaiYear = selectedDate.getFullYear() + 543;

    // ใช้ format จาก date-fns
    const formattedDate = format(selectedDate, "dd-MM-") + thaiYear; // เก็บปีในรูปแบบ BE

    setSelectedDate(formattedDate); // เก็บวันที่ที่แปลงแล้วใน state
    setDate(selectedDate); // เก็บ Date object
    setValue("birthday", selectedDate); // ส่งค่าไปยัง react-hook-form
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

      // สร้างโฟลเดอร์หากยังไม่มี
      const imgDir = FileSystem.documentDirectory + "images/";
      await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });

      // บันทึกรูปภาพลงในเครื่อง
      const filename = new Date().getTime() + ".jpeg";
      const dest = imgDir + filename;
      await FileSystem.copyAsync({ from: selectedImageUri, to: dest });
      setChildPic(dest); // ตั้ง path ของภาพที่บันทึกไว้ใน state
      console.log("Selected and saved Image URI:", dest);
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูล
  const onSubmit: SubmitHandler<AddChildModel> = async (formData) => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("userToken");

    console.log("Form data:", formData);
    console.log("UserId: ", userId);
    console.log("Date: ", selectedDate);
    //console.log("childPic data:", childPic);

    try {
      const data = new FormData();
      // Append values only if they are not null
      if (formData.firstName) {
        data.append("firstName", formData.firstName);
      }
      if (formData.lastName) {
        data.append("lastName", formData.lastName);
      }
      if (formData.nickName) {
        data.append("nickName", formData.nickName);
      }
      if (selectedDate) {
        data.append("birthday", selectedDate);
      }
      if (formData.gender) {
        data.append("gender", formData.gender);
      }
      if (userId) {
        data.append("parent_id", userId);
      }

      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (childPic) {
        try {
          const filename = childPic.split("/").pop();
          const imageType = "image/jpeg";

          data.append("childPic", {
            uri: childPic,
            name: filename,
            type: imageType,
          } as any);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      } else {
        let defaultImage =
          formData.gender === "male"
            ? require("../../../assets/icons/boyIcon.png")
            : require("../../../assets/icons/girlIcon.png");

        data.append("childPic", {
          uri: childPic ? childPic : Image.resolveAssetSource(defaultImage).uri,
          name: "userIcon.png",
          type: "image/png",
        } as any);
      }

      // ส่งคำขอไปยัง API
      const resp = await fetch(`${API_ENDPOINT}/${API_ADD_CHILD_PARENT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      // ตรวจสอบสถานะของการตอบสนองจาก API
      const jsonResp = await resp.json();
      console.log("API Response:", jsonResp);

      if (resp.ok) {
        Alert.alert("สำเร็จ", "เพิ่มข้อมูลเด็กสำเร็จ");
        // await AsyncStorage.setItem("ProfileChild", jsonResp.childPic);
        navigation.navigate("mainPR");
      } else if (resp.status === 409) {
        Alert.alert("ไม่สำเร็จ", "มีเด็กในระบบอยู่แล้ว");
        navigation.navigate("mainPR");
      } else {
        const errorResponse = await resp.text();
        console.error("Error response from server:", errorResponse);
        Alert.alert("ระบบมีปัญหา", errorResponse || "กรุณาลองอีกครั้ง");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("ระบบมีปัญหา", "กรุณาลองอีกครั้ง");
    }
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
        <SafeAreaProvider>
          <ImageBackground
            source={require("../../../assets/background/bg2.png")}
            style={styles.background}
          >
            {/* <SafeAreaView style={{ flex: 1 }}> */}
            {/* Top Section */}
            <Text style={styles.HeaderText}>ข้อมูลเด็กที่ต้องการเพิ่ม</Text>

            {/* Mid Section */}
            <View style={styles.Inputcontainer}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={selectImage}
              >
                {/* placeholder of Picture */}
                <View style={styles.avtarFrame}>
                  {childPic ? (
                    <Image source={{ uri: childPic }} style={styles.avatar} />
                  ) : (
                    <Image
                      source={require("../../../assets/icons/addchildpr.png")}
                      style={styles.avatar}
                    />
                  )}
                </View>
                {/* <Pressable style={styles.addIconSection} onPress={selectImage}>
                  <Image
                    source={require("../../../assets/icons/image-gallery.png")}
                    style={styles.addIcon}
                  />
                </Pressable> */}
              </TouchableOpacity>
              <Text
                style={{
                  position: "absolute",
                  top: 50,
                  zIndex: 1,
                  color: "gray",
                  fontStyle: "italic",
                }}
              >
                กรุณาเลือกรูปภาพ
              </Text>
              <LinearGradient
                colors={["#E2F0E9", "#F1FFEC", "#ECFFF8"]}
                style={styles.container}
              >
                {/* Input Section */}
                <View style={styles.MiddleSection}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={[
                            styles.input,
                            errors.firstName && styles.errorInput,
                          ]}
                          placeholder="ชื่อเด็ก"
                          placeholderTextColor="#A9A9A9"
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.firstName && (
                          <Text style={styles.errorText}>
                            {errors.firstName && (
                              <Text style={styles.errorText}>
                                กรุณาระบุชื่อเด็ก
                              </Text>
                            )}
                          </Text>
                        )}
                      </>
                    )}
                  />

                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={[
                            styles.input,
                            errors.lastName && styles.errorInput,
                          ]}
                          placeholder="นามสกุลเด็ก"
                          placeholderTextColor="#A9A9A9"
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.lastName && (
                          <Text style={styles.errorText}>
                            {errors.lastName && (
                              <Text style={styles.errorText}>
                                กรุณาระบุนามสกุลเด็ก
                              </Text>
                            )}
                          </Text>
                        )}
                      </>
                    )}
                  />

                  <Controller
                    control={control}
                    name="nickName"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={[
                            styles.input,
                            errors.nickName && styles.errorInput,
                          ]}
                          placeholder="ชื่อเล่น"
                          placeholderTextColor="#A9A9A9"
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.nickName && (
                          <Text style={styles.errorText}>
                            {errors.nickName && (
                              <Text style={styles.errorText}>
                                กรุณาระบุชื่อเล่นเด็ก
                              </Text>
                            )}
                          </Text>
                        )}
                      </>
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
                      rules={{ required: "กรุณาเลือกเพศ" }} // Add validation rule here
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
                              }
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
                              }
                            />
                            <Text>หญิง</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                    {/* Error Message */}
                    {errors.gender && (
                      <Text style={styles.errorTextGender}>
                        กรุณาระบุเพศเด็ก
                      </Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>
            {/* Bottom Section */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={goBack}>
                <Image
                  source={require("../../../assets/icons/back.png")}
                  style={styles.Icon}
                />
              </Pressable>
              <Pressable
                //onPress={whenGotoAssessment}
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
              >
                <Text style={styles.buttonText}>บันทึก</Text>
              </Pressable>
            </View>
            {/* </SafeAreaView> */}
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
    // height: "100%",
    justifyContent: "center",
    marginTop: 60,
    padding: 10,
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
    left: 120,
    marginBottom: 10,
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
  buttonContainer: {
    position: "absolute",
    bottom: 125,
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
  avatarContainer: {
    position: "absolute",
    top: -55,
    zIndex: 1,
    // borderWidth: 3,
  },
  avtarFrame: {
    borderRadius: 50,
    backgroundColor: "#D9D9D9",
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    //borderWidth:1,
  },
  addIcon: {
    // top: 4,
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
    justifyContent: "center",
    backgroundColor: "#C5E5FC",
    borderWidth: 2,
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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

  confirmButton: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
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
  cancelButton: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "gray",
    fontStyle: "italic",
  },
});
