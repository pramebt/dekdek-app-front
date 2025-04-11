// Assessment.tsx
import { FC, useState } from "react";
import {
  ImageBackground,
  View,
  StyleSheet,
  Pressable,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Child } from "./HomeSP";
import { LinearGradient } from "expo-linear-gradient";

type AssessmentRouteProp = RouteProp<
  { assessment: { child: Child } },
  "assessment"
>;

export const AspectSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<AssessmentRouteProp>();
  const { child } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  // navigate
  // const whenGotoGMSP = (child: Child) => {
  //   navigation.navigate("gmsp", { child });
  // };

  // const whenGotoFMSP = (child: Child) => {
  //   navigation.navigate("fmsp", { child });
  // };

  // const whenGotoRLSP = (child: Child) => {
  //   navigation.navigate("rlsp", { child });
  // };

  // const whenGotoELSP = (child: Child) => {
  //   navigation.navigate("elsp", { child });
  // };

  // const whenGotoPSSP = (child: Child) => {
  //   navigation.navigate("spsp", { child });
  // };

  const whenGotoHomeSP = () => {
    navigation.navigate("mainSP");
  };
  const whenGotoChildDetailSP = (child: Child) => {
    setModalVisible(false);
    navigation.navigate("childdetailsp", { child });
  };

  const whenGotoDetailPRforSP = (child: Child) => {
    setModalVisible(false);
    navigation.navigate("childdetailprforsp", { child });
  };

  // whenGotoAssessment
  const whenGotoAssessment = (child: Child, aspect: string) => {
    navigation.navigate("assessmentsp", { child, aspect });
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
          {/* Top Section */}
          <View style={styles.topSection}>
            <LinearGradient
              key={child.child_id}
              colors={
                child.gender === "male"
                  ? ["#fff", "#E7F6FF", "#D6ECFD"] // ไล่สีฟ้าสำหรับเด็กผู้ชาย
                  : ["#fff", "#FFDEE4", "#FFBED6"] // ไล่สีชมพูสำหรับเด็กผู้หญิง
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={
                child.gender === "male"
                  ? styles.profileCardBoy
                  : styles.profileCardGirl
              }
            >
              <Image
                source={{ uri: child.childPic }}
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
                          style={[styles.modalButton, styles.confirmButton]}
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
                          style={[styles.modalButton, styles.confirmButton]}
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
                        <Text style={styles.cancelbuttonText}>ยกเลิก</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            </LinearGradient>
          </View>

          {/* Mid Section */}
          <View style={styles.midSection}>
            <Text style={styles.headerText}>เลือกด้านที่ต้องการประเมิน</Text>
            {/* GM */}
            <Pressable
              style={styles.childDev}
              onPress={() => whenGotoAssessment(child, "GM")}
            >
              <Image
                source={require("../../../assets/icons/GM.png")}
                style={styles.childDevIcon}
              />
              <Text style={styles.childDevtext}>ด้านการเคลื่อนไหว (GM)</Text>
            </Pressable>
            {/* FM */}
            <Pressable
              style={styles.childDev}
              onPress={() => whenGotoAssessment(child, "FM")}
            >
              <Image
                source={require("../../../assets/icons/FM.png")}
                style={styles.childDevIcon}
              />
              <Text style={styles.childDevtext}>
                {" "}
                ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา (FM)
              </Text>
            </Pressable>
            {/* RL */}
            <Pressable
              style={styles.childDev}
              onPress={() => whenGotoAssessment(child, "RL")}
            >
              <Image
                source={require("../../../assets/icons/RL.png")}
                style={styles.childDevIcon}
              />
              <Text style={styles.childDevtext}>ด้านการใช้ภาษา (RL)</Text>
            </Pressable>
            {/* EL */}
            <Pressable
              style={styles.childDev}
              onPress={() => whenGotoAssessment(child, "EL")}
            >
              <Image
                source={require("../../../assets/icons/EL.png")}
                style={styles.childDevIcon}
              />
              <Text style={styles.childDevtext}>ด้านการเข้าใจภาษา (EL)</Text>
            </Pressable>
            {/* PS */}
            <Pressable
              style={styles.childDev}
              onPress={() => whenGotoAssessment(child, "PS")}
            >
              <Image
                source={require("../../../assets/icons/PS.png")}
                style={styles.childDevIcon}
              />
              <Text style={styles.childDevtext}>
                ด้านการช่วยเหลือตัวเองและสังคม (PS)
              </Text>
            </Pressable>
          </View>
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.backButton} onPress={goBack}>
                <Image
                  source={require("../../../assets/icons/back.png")}
                  style={styles.Icon}
                />
              </Pressable>
              <Pressable onPress={whenGotoHomeSP} style={styles.homeButton}>
                <Image
                  source={require("../../../assets/icons/home.png")}
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
    paddingTop: "7%",
    // borderWidth: 2,
  },
  topSection: {
    // flex: 1,
    width: "100%",
    alignItems: "center",
    // borderWidth: 2,
  },
  midSection: {
    // flex: 1,
    width: "auto",
    minHeight: 500,
    marginTop: 15,
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#E0F7F3",
    alignItems: "center",
    // borderWidth: 2,
  },
  bottomSection: {
    // flexDirection: "row",
    width: "90%",
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    // borderWidth: 2,
  },
  profileCardGirl: {
    flexDirection: "row",
    width: "95%",
    height: 130,
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginTop: "3%",
    //borderWidth:2,
  },
  profileCardBoy: {
    flexDirection: "row",
    width: "95%",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginTop: "3%",
    //borderWidth:2,
  },
  profileIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
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
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 9,
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
  },
  buttonContainer: {
    flexDirection: "row",
    width: "80%",
    height: 85,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  homeButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  Icon: {
    width: 30,
    height: 30,
  },
  childDev: {
    flexDirection: "row",
    width: "95%",
    paddingVertical: 15,
    marginVertical: 6,
    shadowColor: "#b5b5b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  childDevIcon: {
    width: 45,
    height: 45,
    right: 10,
  },
  childDevtext: {
    fontSize: 16,
    maxWidth: "64%",
    textAlign: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    bottom: 5,
    marginTop: 10,
    marginBottom: 5,
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
