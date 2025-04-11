import React, { FC, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { usePushNotifications } from "../../app/usePushNotifications"; // hook สำหรับ push notification
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { LoadingScreenSendApprove } from "../LoadingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface Notification {
  notification_id: number;
  // user_id: number;
  message: string;
  supervisor_id?: number;
  child_id?: number;
  status?: "unread" | "read";
  created_at?: string; // อนุญาตให้เป็น optional ถ้า API ไม่ส่งมา
  template_id?: number;
}

interface NotificateProps {
  setNotificationCount: (count: number) => void; // ✅ รับค่าจาก MainPR
}

// Define API URL
import {
  API_ENDPOINT,
  API_GET_NOTIFICATE,
  API_NOTIFICATE_APPROVE_REQUEST,
  API_NOTIFICATE_MARK_READ,
  API_NOTIFICATE_REJECT_REQUEST,
} from "@env";

export const Notificate: FC<NotificateProps> = ({ setNotificationCount }) => {
  const { notification } = usePushNotifications(); // รับการแจ้งเตือนจาก push notification
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const fetchNotifications = async () => {
    try {
      const user_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      if (!user_id) return console.error("User ID is missing.");

      console.log("🔵 Fetching notifications for user ID:", user_id);

      const response = await fetch(
        `${API_ENDPOINT}/${API_GET_NOTIFICATE}?user_id=${user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Error fetching notifications");

      const data = await response.json();
      setNotifications(data.notifications);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      if (notification) {
        const newNotification: Notification = {
          notification_id:
            notification.request.content.data?.notification_id ?? Date.now(),
          message: notification.request.content.body ?? "",
          status: "unread",
          created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
      }
    }, [notification])
  );

  // ✅ นับจำนวน unread notifications ทุกครั้งที่รายการแจ้งเตือนเปลี่ยนแปลง
  useEffect(() => {
    const unreadCount = notifications.filter(
      (n) => n.status === "unread"
    ).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api approveAccessRequest
  const handleApprove = async (
    child_id: number,
    supervisor_id: number,
    notification_id: number
  ) => {
    console.log("child_id: ", child_id);
    console.log("supervisor_id: ", supervisor_id);

    try {
      const parent_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINT}/${API_NOTIFICATE_APPROVE_REQUEST}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            child_id,
            supervisor_id,
            parent_id,
            notification_id,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLoading(false);
        fetchNotifications();
      } else if (!response.ok)
        throw new Error(data.message || "Approval failed.");
      console.log("Approval successful:", data.message);
      setLoading(false);
    } catch (error) {
      console.error("Error approving access request:", error);
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api approveAccessRequest
  const handleReject = async (
    child_id: number,
    supervisor_id: number,
    notification_id: number
  ) => {
    console.log("child_id: ", child_id);
    console.log("supervisor_id: ", supervisor_id);

    try {
      const parent_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINT}/${API_NOTIFICATE_REJECT_REQUEST}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            child_id,
            supervisor_id,
            parent_id,
            notification_id,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLoading(false);
        fetchNotifications();
      } else if (!response.ok)
        throw new Error(data.message || "Approval failed.");
      console.log("Approval successful:", data.message);
      setLoading(false);
    } catch (error) {
      console.error("Error approving access request:", error);
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // api markAsRead
  const markAsRead = async (notification_id: number) => {
    const role = await AsyncStorage.getItem("userRole");

    try {
      const response = await fetch(
        `${API_ENDPOINT}/${API_NOTIFICATE_MARK_READ}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("🔵 อัปเดตสถานะแจ้งเตือนเป็น 'read' แล้ว:", data);
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.notification_id === notification_id
              ? { ...notif, status: "read" }
              : notif
          )
        );
        if (role == "parent") {
          navigation.navigate("choosechild");
        } else if (role == "supervisor") {
          navigation.navigate("chooseroom");
        } else {
          console.log("Unknown role:", role);
        }
      } else {
        console.error("🔴 ไม่สามารถอัปเดตแจ้งเตือนได้:", data.message);
      }
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // render Teamplate Notificate
  const renderNotificate = () => {
    return (
      // <View style={styles.container}>
      <ScrollView
        style={styles.ScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.map((notif, index) => {
          switch (notif.template_id) {
            case 1:
              return (
                <View
                  key={index}
                  style={[
                    styles.notificationBox,
                    notif.status === "read"
                      ? styles.readNotification
                      : styles.unreadNotification,
                  ]}
                >
                  {loading ? (
                    <LoadingScreenSendApprove />
                  ) : (
                    <>
                      <Text style={styles.date}>
                        {notif.created_at
                          ? new Intl.DateTimeFormat("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(notif.created_at))
                          : "ไม่ทราบวันที่"}
                      </Text>
                      <View style={styles.notificationTopBox}>
                        <View style={styles.iconContainer}>
                          <LottieView
                            source={require("../../assets/logo/lottie/letter.json")}
                            autoPlay
                            loop
                            style={styles.icon}
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.message}>{notif.message}</Text>
                        </View>
                      </View>
                      <View style={styles.resultButtonCantainer}>
                        <Pressable
                          style={styles.yesButton}
                          onPress={() => {
                            if (
                              notif.child_id !== undefined &&
                              notif.supervisor_id !== undefined
                            ) {
                              handleApprove(
                                notif.child_id,
                                notif.supervisor_id,
                                notif.notification_id
                              );
                            } else {
                              console.error(
                                "child_id or supervisor_id is missing"
                              );
                            }
                          }}
                        >
                          <Text>ยินยอม</Text>
                        </Pressable>
                        <Pressable
                          style={styles.noButton}
                          onPress={() => {
                            if (
                              notif.child_id !== undefined &&
                              notif.supervisor_id !== undefined
                            ) {
                              handleReject(
                                notif.child_id,
                                notif.supervisor_id,
                                notif.notification_id
                              );
                            } else {
                              console.error(
                                "child_id or supervisor_id is missing"
                              );
                            }
                          }}
                        >
                          <Text>ปฎิเสธ</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              );

            case 2:
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.notificationBox,
                    notif.status === "read"
                      ? styles.readNotification
                      : styles.unreadNotification,
                  ]}
                  onPress={() => markAsRead(notif.notification_id)}
                >
                  <Text style={styles.date}>
                    {notif.created_at
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notif.created_at))
                      : "ไม่ทราบวันที่"}
                  </Text>
                  <View style={styles.notificationTopBox}>
                    <View style={styles.iconContainer}>
                      <LottieView
                        source={require("../../assets/logo/lottie/warning.json")}
                        autoPlay
                        loop={false}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.message}>{notif.message}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );

            case 3:
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.notificationBox,
                    notif.status === "read"
                      ? styles.readNotification
                      : styles.unreadNotification,
                  ]}
                >
                  <Text style={styles.date}>
                    {notif.created_at
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notif.created_at))
                      : "ไม่ทราบวันที่"}
                  </Text>
                  <View style={styles.notificationTopBox}>
                    <View style={styles.iconContainer}>
                      <LottieView
                        source={require("../../assets/logo/lottie/checkmark.json")}
                        autoPlay
                        loop={false}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.message}>{notif.message}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );

            case 4:
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.notificationBox,
                    notif.status === "read"
                      ? styles.readNotification
                      : styles.unreadNotification,
                  ]}
                >
                  <Text style={styles.date}>
                    {notif.created_at
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notif.created_at))
                      : "ไม่ทราบวันที่"}
                  </Text>
                  <View style={styles.notificationTopBox}>
                    <View style={styles.iconContainer}>
                      <LottieView
                        source={require("../../assets/logo/lottie/checkmark.json")}
                        autoPlay
                        loop={false}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.message}>{notif.message}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );

            default:
              return <View key={index}></View>;
          }
        })}
      </ScrollView>
      // </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg1.png")}
        style={styles.background}
      >
        {/* <SafeAreaView style={{ flex: 1 }}> */}
        <Text style={styles.header}>การแจ้งเตือน</Text>

        <View style={styles.container}>{renderNotificate()}</View>
        {/* </SafeAreaView> */}
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  ScrollView: {
    width: "100%",
    borderRadius: 30,
    paddingTop: 10,
    marginBottom: 10,
    // borderWidth: 2,
  },
  container: {
    flex: 1,
    width: "100%",
    padding: "5%",
    alignItems: "center",
    // borderWidth: 2,
  },
  notificationTopBox: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderColor: "#333333",
    width: "100%",
    height: "50%",
    // borderWidth: 2,
  },
  notificationBox: {
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 10,
    borderColor: "#333333",
    borderWidth: 1,
    width: "100%",
    height: 150,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  date: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    marginHorizontal: 15,
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 60,
    height: 55,
    // borderWidth: 2,
  },
  textContainer: {
    flex: 1,
    // borderWidth: 2,
  },
  message: {
    fontSize: 16,
    color: "#333333",
  },
  name: {
    fontWeight: "bold",
    color: "#6495ED",
  },

  header: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
    marginTop: "15%",
  },

  resultButtonCantainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: "15%",
    // borderWidth: 2,
  },
  yesButton: {
    backgroundColor: "#DAF0C8",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#FFC1C1",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },

  // markAsRead or Unread
  unreadNotification: {
    backgroundColor: "#FFEBEE", // สีแดงอ่อนสำหรับแจ้งเตือนที่ยังไม่อ่าน
    borderColor: "#D32F2F",
  },
  readNotification: {
    backgroundColor: "#E0F7FA", // สีฟ้าอ่อนสำหรับแจ้งเตือนที่อ่านแล้ว
    borderColor: "#00ACC1",
  },
});
