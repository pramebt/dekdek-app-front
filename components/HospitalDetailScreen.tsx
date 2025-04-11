import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { HospitalData } from "../types";

import { RouteProp } from "@react-navigation/native";

type HospitalDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "HospitalDetailScreen"
>;

type RootStackParamList = {
  Advice: undefined;
  HospitalDetailScreen: { hospital: HospitalData };
};

type Props = {
  route: HospitalDetailScreenRouteProp;
};

export const HospitalDetailScreen: React.FC<Props> = ({ route }) => {
  const { hospital } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: hospital.image || "https://via.placeholder.com/400" }}
        style={styles.image}
      />
      <Text style={styles.name}>{hospital.name}</Text>
      <Text style={styles.address}>{hospital.address}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>เวลาทำการ</Text>
        <Text>เปิด 24 ชั่วโมง</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ข้อมูลเพิ่มเติม</Text>
        <Text>🏥 {hospital.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>เบอร์ติดต่อ</Text>
        <Text>📞 02-xxx-xxxx</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
