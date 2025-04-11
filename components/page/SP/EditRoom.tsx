import React, { FC, useState, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

// Form validation schema
const AddRoomSchema = z.object({
  rooms_name: z.string().min(3, "กรุณาระบุชื่อห้องเรียน").max(150),
  // colors: z.string(),
});
// กำหนดสีให้เลือก 7 สี
const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F1C40F",
  "#8E44AD",
  "#1ABC9C",
  "#E74C3C",
];
// Type Definitions
type AddRoomModel = z.infer<typeof AddRoomSchema>;
import { Room } from "./HomeSP";
type RoomsRouteProp = RouteProp<{ assessment: { rooms: Room } }, "assessment">;

// Define API URL
import { API_DELETE_ROOM, API_ENDPOINT, API_UPDATE_ROOM } from "@env";

export const EditRoom: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<AddRoomModel>({
    resolver: zodResolver(AddRoomSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();
  const Roomsroute = useRoute<RoomsRouteProp>();
  const { rooms } = Roomsroute.params;
  const [roomsPic, setroomsPic] = useState<string | null>(
    rooms.roomsPic || null
  );
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (rooms) {
      setValue("rooms_name", rooms.rooms_name || "");
    }
  }, [rooms, setValue]);
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
      const { rooms_name } = getValues();
      const storeRoomsName = rooms.rooms_name;

      if (rooms_name === storeRoomsName && !roomsPic) {
        Alert.alert("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลก่อนกดบันทึก");
        return;
      }
      if (rooms_name !== storeRoomsName) {
        data.append("rooms_name", rooms_name);
      }

      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (roomsPic) {
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
      } else {
        console.log("No roomsPic provided");
      }

      // ส่งคำขอไปยัง API
      const resp = await fetch(
        `${API_ENDPOINT}/${API_UPDATE_ROOM}/${rooms.rooms_id}/${supervisor_id}`,
        {
          method: "PUT",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken ?? "",
          },
        }
      );

      // ตรวจสอบสถานะของการตอบสนองจาก API
      const result = await resp.json();

      if (resp.ok) {
        Alert.alert("สำเร็จ", "อัปเดตข้อมูลห้องเรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => navigation.navigate("mainSP") },
        ]);
      } else {
        Alert.alert(result.message || "ไม่สามารถอัปเดตได้");
      }
    } catch (error) {
      console.error("Error updating child profile:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดระหว่างการอัปเดตข้อมูล");
    }
  };

  const handleDeleteRoom = async (rooms_id: number) => {
    // setIsLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const supervisor_id = await AsyncStorage.getItem("userId");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    try {
      const response = await fetch(
        `${API_ENDPOINT}/${API_DELETE_ROOM}/${rooms.rooms_id}/${supervisor_id}`,
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
            onPress: () => navigation.navigate("mainSP"),
          },
        ]);
        // navigation.navigate("mainSP");
      } else {
        Alert.alert("ลบไม่สำเร็จ", result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting child:", error);
      Alert.alert("ลบไม่สำเร็จ", "เกิดข้อผิดพลาดขณะลบข้อมูลเด็ก");
    } finally {
      // setIsLoading(false);
    }
  };
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
        <Text style={styles.HeaderText}>ข้อมูลห้องเรียน</Text>

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
          </View>
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
        {/* ปุ่มลบเด็ก */}
        <Pressable
          style={styles.deleteChild}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={require("../../../assets/icons/delete.png")}
            style={styles.deleteRoomIcon}
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
                คุณต้องการลบข้อมูลห้องใช่หรือไม่?
              </Text>
              <Text style={styles.modaltitleText}>
                ข้อมูลห้องและข้อมูลเด็กในห้องจะถูกลบออกจากบัญชีของคุณ
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
                  onPress={() => handleDeleteRoom(rooms.rooms_id)}
                >
                  <Text style={styles.buttonText}>ยืนยัน</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  // Avatar Section
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
    paddingLeft: 20,
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
  deleteChild: {
    //borderWidth:1,
    width: 90,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#FF8E8E",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  deleteRoomIcon: {
    width: "35%",
    marginLeft: 7,
    //height:40,
    //borderWidth:1,
  },
  confirmButton: {
    backgroundColor: "#CAEEE1",
  },
});
