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
  FlatList,
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
import { LinearGradient } from "expo-linear-gradient";

// Form validation schema
const AddRoomSchema = z.object({
  rooms_name: z.string().min(3, "กรุณาระบุชื่อห้องเรียน").max(150),
  // colors: z.string(),
});
// กำหนดสีให้เลือก 7 สี
const colors = [
  "#FFA2C4",
  "#F9C167",
  "#8DD9BD",
  "#98D4FF",
  "#B695F8",
  // "#1ABC9C",
  // "#E74C3C",
];
// Type Definitions
type AddRoomModel = z.infer<typeof AddRoomSchema>;

// Define API URL
import { API_ADD_ROOM, API_ENDPOINT } from "@env";

export const AddRoom: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddRoomModel>({
    resolver: zodResolver(AddRoomSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();

  const [roomsPic, setroomsPic] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
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
      setroomsPic(dest); // ตั้ง path ของภาพที่บันทึกไว้ใน state
      console.log("Selected and saved Image URI:", dest);
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูล
  const onSubmit: SubmitHandler<AddRoomModel> = async (formData) => {
    const supervisor_id = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    console.log("Form data:", formData);
    console.log("colors", selectedColor);
    // console.log("UserId: ", supervisor_id);
    //console.log("childPic data:", childPic);

    try {
      const data = new FormData();
      // Append values only if they are not null
      if (formData.rooms_name) {
        data.append("rooms_name", formData.rooms_name);
      }
      if (supervisor_id) {
        data.append("supervisor_id", supervisor_id);
      }
      if (selectedColor) {
        data.append("colors", selectedColor);
      }
      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (roomsPic) {
        try {
          // Use the file URI directly without fetching it
          const filename = roomsPic.split("/").pop(); // Extract filename from URI
          const imageType = "image/jpeg"; // Change according to your image type

          // Append the image correctly to FormData
          data.append("roomsPic", {
            uri: roomsPic,
            name: filename,
            type: imageType, // Set the correct type
          } as any); // Use 'as any' to bypass type checking if necessary

          console.log("roomsPic data:", roomsPic);
          console.log("Appending image with filename:", filename);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      } else {
        console.log("No roomsPic provided");
      }

      // ส่งคำขอไปยัง API
      const resp = await fetch(`${API_ENDPOINT}/${API_ADD_ROOM}`, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-refresh-token": refreshToken ?? "",
        },
      });

      // ตรวจสอบสถานะของการตอบสนองจาก API
      const jsonResp = await resp.json();
      console.log("API Response:", jsonResp);

      if (resp.ok) {
        Alert.alert("สำเร็จ", "เพิ่มห้องเรียนสำเร็จ");
        // await AsyncStorage.setItem("ProfileChild", jsonResp.childPic);
        navigation.navigate("mainSP");
      } else if (resp.status === 409) {
        Alert.alert("ไม่สำเร็จ", "มีห้องเรียนนี้ในระบบอยู่แล้ว");
        navigation.navigate("mainSP");
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
  // // for test
  // const whenGotoAssessment = () => {
  //   navigation.navigate("assessment");
  // };
  // // navigate to
  // const whenGoBacktoHome = () => {
  //   navigation.navigate("mainPR");
  // };
  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
      <ImageBackground
        source={require("../../../assets/background/bg2.png")}
        style={styles.background}
      >
        {/* Top Section */}
        <Text style={styles.HeaderText}>ข้อมูลห้องเรียนที่ต้องการเพิ่ม</Text>

        {/* Mid Section */}
        <View style={styles.Inputcontainer}>
          <View style={styles.avatarContainer}>
            {/* placeholder of Picture */}
            <View style={styles.avtarFrame}>
              {roomsPic ? (
                <Image source={{ uri: roomsPic }} style={styles.avatar} />
              ) : (
                <Image
                  source={require("../../../assets/icons/userIcon.png")}
                  style={styles.avatar}
                />
              )}
            </View>
            <Pressable style={styles.addIconSection} onPress={selectImage}>
              <Image
                source={require("../../../assets/icons/add.png")}
                style={styles.addIcon}
              />
            </Pressable>
          </View>

          {/* Input Section */}
          <View style={styles.MiddleSection}>
            <Controller
              control={control}
              name="rooms_name"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.rooms_name && styles.errorInput,
                    ]}
                    placeholder="ชื่อห้องเรียน"
                    placeholderTextColor="#A9A9A9"
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.rooms_name && (
                    <Text style={styles.errorText}>
                      {errors.rooms_name && (
                        <Text style={styles.errorText}>
                          กรุณาระบุชื่อห้องเรียน
                        </Text>
                      )}
                    </Text>
                  )}
                </>
              )}
            />
            <Pressable
              style={[styles.colorBox, { backgroundColor: selectedColor }]}
              onPress={() => setIsColorModalVisible(true)}
            >
              <Text style={styles.colorText}>เลือกสีห้อง</Text>
            </Pressable>
          </View>

          <Modal
            visible={isColorModalVisible}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalContainer}>
              <FlatList
                data={colors}
                numColumns={3}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.colorOption,
                      { backgroundColor: item },
                      selectedColor === item && styles.selectedColor, // เพิ่มเงื่อนไขเลือกสี
                    ]}
                    onPress={() => {
                      setSelectedColor(item);
                      setIsColorModalVisible(false);
                      console.log("Selected color", selectedColor);
                    }}
                  />
                )}
                keyExtractor={(item) => item}
              />
            </View>
          </Modal>
        </View>
        {/* Bottom Section */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../../assets/icons/back.png")}
              style={styles.Icon}
            />
          </Pressable>
          <TouchableOpacity
            //onPress={whenGotoAssessment}
            onPress={() => {
              console.log("selected color", selectedColor);
              handleSubmit(onSubmit)();
            }}
            style={styles.submitButton}
          >
            <Text style={styles.buttonText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* </ScrollView> */}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  MiddleSection: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingBottom: "70%",
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
    flexDirection: "row",
    width: "90%",
    height: "61%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    top: 0,
    // borderWidth: 2,
    marginTop: 60, // Add marginTop to prevent overlapping
  },
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#eafff8",
    borderRadius: 20,
    padding: 20,
    // borderWidth: 2,
  },

  input: {
    width: "100%",
    height: 50,
    borderColor: "#D9D9D9",
    borderWidth: 2,
    borderRadius: 25,
    paddingLeft: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
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
  buttonContainer: {
    position: "absolute",
    bottom: 25,
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
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFD3AB",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    left: 20,
    right: 50,
    padding: 8,
    borderRadius: 30,
    width: "25%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#cce9fe",
    left: 70,
    right: 20,
    padding: 10,
    borderRadius: 30,
    width: "50%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },
  errorInput: {
    borderColor: "red",
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
  colorBox: {
    borderColor: "#D9D9D9",
    borderWidth: 2,
    borderRadius: 25,
    // paddingLeft: 20,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  colorText: {
    color: "#FFF",
  },
  colorOption: {
    width: 60, // ปรับขนาดวงกลม
    height: 60,
    margin: 10,
    borderRadius: 30, // ทำให้เป็นวงกลม
    justifyContent: "center",
    alignItems: "center",
  },

  selectedColor: {
    borderWidth: 4, // ทำกรอบสีให้ชัดเจน
    borderColor: "#FFF", // สีกรอบ (สามารถเปลี่ยนได้)
  },
  modalContainer: {
    flex: 1,
    height: "100%",
    paddingTop: "70%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});
