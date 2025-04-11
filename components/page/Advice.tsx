import React, { FC, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Linking,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface HospitalData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const Advice: FC = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "กรุณาเปิดการใช้ตำแหน่งใน Settings เพื่อใช้งานแผนที่",
          [{ text: "OK", onPress: () => Linking.openSettings() }]
        );
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      fetchNearbyHospitals(currentLocation.coords);

      // ส่งตำแหน่งของฉันไปยัง WebView
      webViewRef.current?.injectJavaScript(`
        updateMyLocation(${currentLocation.coords.latitude}, ${currentLocation.coords.longitude});
      `);
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const fetchNearbyHospitals = async (
    coords: Location.LocationObjectCoords
  ) => {
    const url = `https://api.longdo.com/POIService/json/search?key=3741ef2a6683766f989dd2cb5450d313&lat=${coords.latitude}&lon=${coords.longitude}&tag=hospital`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        const hospitals = data.data
          .filter((item: { lat: any; lon: any }) => item.lat && item.lon)
          .map(
            (item: {
              id: any;
              name: any;
              address: any;
              lat: any;
              lon: any;
            }) => ({
              id: item.id.toString(),
              name: item.name || "Unknown",
              address: item.address || "No address available",
              latitude: item.lat,
              longitude: item.lon,
            })
          );

        setHospitals(hospitals);

        // ส่งข้อมูลโรงพยาบาลไปยัง WebView
        const hospitalsJS = JSON.stringify(hospitals);
        webViewRef.current?.injectJavaScript(`updateMarkers(${hospitalsJS})`);
      } else {
        console.error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        html, body { height: 100%; margin: 0; }
        #map { width: 100%; height: 100%; }
      </style>
      <script src="https://api.longdo.com/map/?key=3741ef2a6683766f989dd2cb5450d313"></script>
      <script>
        var map;
        var myLocationMarker;

        function init() {
          map = new longdo.Map({ placeholder: document.getElementById('map') });
        }

        function updateMarkers(hospitals) {
          map.Overlays.clear();
          hospitals.forEach(hospital => {
            map.Overlays.add(new longdo.Marker({ lon: hospital.longitude, lat: hospital.latitude }, {
              title: hospital.name,
              detail: hospital.address
            }));
          });
        }

        function updateMyLocation(lat, lon) {
          if (myLocationMarker) {
            map.Overlays.remove(myLocationMarker);
          }

          myLocationMarker = new longdo.Marker(
            { lon: lon, lat: lat },
            {
              title: "ตำแหน่งของฉัน",
              icon: {
                html: '<div style="background: red; width: 15px; height: 15px; border-radius: 50%;"></div>',
              },
            }
          );

          map.Overlays.add(myLocationMarker);
          map.location({ lon: lon, lat: lat }, true);
          map.zoom(15, true);
        }
      </script>
    </head>
    <body onload="init();">
      <div id="map"></div>
    </body>
    </html>
  `;

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg1.png")}
        style={styles.background}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.mapContainer}>
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: mapHtml }}
                style={styles.map}
              />
            </View>

            <FlatList
              style={styles.listContainer}
              data={hospitals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.hospitalName}>{item.name}</Text>
                  <Text>{item.address}</Text>
                </View>
              )}
            />
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
  },
  container: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 30,
    paddingRight: 30,
    marginBottom: "25%",
  },
  mapContainer: {
    height: "50%",
    width: "100%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flexShrink: 1,
    height: "50%",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  hospitalName: {
    fontWeight: "bold",
  },
});
