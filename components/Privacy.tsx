import React, { FC } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RegisterModel } from "./Register";

type PrivacyRouteParams = {
  form: RegisterModel;
  onAgree: (form: RegisterModel) => void;
};
//const { reset } = useForm<RegisterModel>();

export const Privacy: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<{ privacy: PrivacyRouteParams }>>();

  const { form, onAgree } = route.params; // รับค่าจากหน้า Register

  const whenAgree = () => {
    // add agree value to form
    const updatedForm = { ...form, agree: true };

    // call function validatePass ที่ถูกส่งมาจากหน้า Register
    onAgree(updatedForm);
  };

  const whenUpset = () => {
    //reset();
    navigation.navigate("login");
  };

  return (
    <>
      <SafeAreaProvider>
        <ImageBackground
          source={require("../assets/background/bg2.png")}
          style={styles.background}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.ScrollView}
            >
              <View style={styles.container}>
                <View style={styles.header}>
                  <Text style={styles.header}>Privacy Policy</Text>
                  <Image
                    source={require("../assets/images/privacypolicy.png")}
                    style={styles.privacySection}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <Pressable style={styles.button} onPress={whenAgree}>
                    <Text style={styles.buttonText}>ยินยอม</Text>
                  </Pressable>
                  <Pressable style={styles.button} onPress={whenUpset}>
                    <Text style={styles.buttonText}>ไม่ยินยอม</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaProvider>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingHorizontal: "5%",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    alignItems: "center",
    marginTop: "5%",
    marginBottom: "5%",
    // borderWidth: 2,
  },
  text: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    // borderWidth: 2,
  },
  button: {
    width: "40%",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
  ScrollView: {
    width: "100%",
    borderRadius: 30,
  },
  privacySection: {
    alignItems: "center",
    width: "100%",
    height: 850,
    borderRadius: 30,
    borderWidth: 1,
  },
});
