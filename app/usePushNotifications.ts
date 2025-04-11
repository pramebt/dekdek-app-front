// usePushNotifications.ts
import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

// Define API URL
import { API_ENDPOINT, API_NOTIFICATE_SAVE_PUSH_TOKEN } from "@env";

// push token for notification
  export const sendExpoPushTokenToBackend = async (
    expoPushToken: Notifications.ExpoPushToken,
    user_id: number
  ) => {
    try {
        const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in storage");
        return;
      }
      const response = await fetch(
        `${API_ENDPOINT}/${API_NOTIFICATE_SAVE_PUSH_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id,
            expoPushToken: expoPushToken.data,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Push token saved:", data.message);
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };


export const usePushNotifications = (): PushNotificationState => {
  // กำหนดการตั้งค่าการแจ้งเตือน
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // ฟังก์ชันสำหรับการลงทะเบียนการแจ้งเตือน
  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // ขออนุญาตจากผู้ใช้
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      // รับ Token สำหรับ Expo Push Notification
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    // ตั้งค่าช่องทางการแจ้งเตือนใน Android
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  useEffect(() => {
    // ลงทะเบียนการแจ้งเตือน
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    // ฟังการแจ้งเตือนที่ได้รับ
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // ฟังการตอบกลับจากการแจ้งเตือน
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      // ทำการลบ subscription เมื่อ component ถูกลบ
      Notifications.removeNotificationSubscription(notificationListener.current!);
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
