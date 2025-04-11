// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import * as Linking from "expo-linking";

// === ( Import Components ) ===
import { Login } from "./components/Login";
import { ForgetPassword } from "./components/ForgetPassword";
import { ResetPassword } from "./components/ResetPassword";
import { Register } from "./components/Register";
import { MainSP } from "./components/MainSP";
import { MainPR } from "./components/MainPR";
import { store } from "./app/store";
import { Welcome } from "./components/Welcome";
import { Privacy } from "./components/Privacy";
import { SplashScreen } from "./components/SplashScreen";
import { AddChild } from "./components/page/PR/Addchild";
import { ChooseChild } from "./components/page/PR/ChooseChild";
import { AspectPR } from "./components/page/PR/AspectPR";
import { AssessmentPR } from "./components/assessment/PR/AssessmentPR";
// import { FM } from "./components/assessment/PR/FM";
// import { RL } from "./components/assessment/PR/RL";
// import { EL } from "./components/assessment/PR/EL";
// import { PS } from "./components/assessment/PR/PS";
import { Training } from "./components/assessment/PR/Training";
import { UpdateProfile } from "./components/page/UpdateProfile";
import { ChildDetail } from "./components/page/PR/ChildDetail";
import { EditChild } from "./components/page/PR/EditChild";
import { HowToUse } from "./components/page/PR/Howtouse";
import { HospitalDetailScreen } from "./components/HospitalDetailScreen";
import { ListHistoryPR } from "./components/assessment/history/ListHistoryPR";
import { AssessmentRetryPR } from "./components/assessment/history/AssessmentRetryPR";

// === ( Import Components Admin ) ===
import { MainAD } from "./components/MainAD";
import { HomeAD } from "./components/page/HomeAD";
import { UserList } from "./components/page/UserList";
import { ChildList } from "./components/page/ChildList";
import { ChildEdit } from "./components/page/ChildEdit";
import { UserEdit } from "./components/page/UserEdit";

// === ( Import Components Supervisor ) ===
import { AspectSP } from "./components/page/SP/AspectSP";
import { AssessmentSP } from "./components/assessment/SP/AssessmentSP";

import { TrainingSP } from "./components/assessment/SP/TrainingSP";
import { ChooseChildSP } from "./components/page/SP/ChooseChildSP";
import { ChildDetailSP } from "./components/page/SP/ChildDetailSP";
import { EditChildSP } from "./components/page/SP/EditChildSP";
import { AddRoom } from "./components/page/SP/AddRoom";
import { AddchildSP } from "./components/page/SP/AddchildSP";
import { ChooseRoom } from "./components/page/SP/ChooseRoom";
import { GraphDashboard } from "./components/page/SP/GraphDashboard";
import { EditRoom } from "./components/page/SP/EditRoom";
import { ChildDetailPRforSP } from "./components/page/SP/ChildDetailPRforSP";
import { ListHistorySP } from "./components/assessment/history/ListHistorySP";
import { AssessmentRetrySP } from "./components/assessment/history/AssessmentRetrySP";

// === ( Navigation Setup ) ===
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    Linking.createURL("/"), // Expo Go
    "dekdek://", // ใช้กับ Custom Scheme บน Mobile
    "https://senior-test-deploy-production-1362.up.railway.app",
  ],
  config: {
    screens: {
      ResetPassword: "reset-password/:token",
    },
  },
};

// === ( Main Application Component ) ===
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" component={SplashScreen} />
          <Stack.Screen name="welcome" component={Welcome} />
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="forgetPassword" component={ForgetPassword} />
          <Stack.Screen name="register" component={Register} />
          <Stack.Screen name="privacy" component={Privacy} />
          <Stack.Screen name="mainPR" component={MainPR} />
          <Stack.Screen name="mainAD" component={MainAD} />
          <Stack.Screen name="userList" component={UserList} />
          <Stack.Screen name="childList" component={ChildList} />
          <Stack.Screen name="childEdit" component={ChildEdit} />
          <Stack.Screen name="userEdit" component={UserEdit} />
          <Stack.Screen name="listhistorypr" component={ListHistoryPR} />

          <Stack.Screen name="mainSP" component={MainSP} />
          <Stack.Screen name="choosechild" component={ChooseChild} />
          <Stack.Screen name="addchild" component={AddChild} />
          <Stack.Screen name="aspectpr" component={AspectPR} />
          <Stack.Screen name="assessmentpr" component={AssessmentPR} />
          {/* <Stack.Screen name="fm" component={FM} />
          <Stack.Screen name="rl" component={RL} />
          <Stack.Screen name="el" component={EL} />
          <Stack.Screen name="sp" component={PS} /> */}
          <Stack.Screen name="training" component={Training} />
          <Stack.Screen name="updateprofile" component={UpdateProfile} />
          <Stack.Screen name="childdetail" component={ChildDetail} />
          <Stack.Screen name="editchild" component={EditChild} />
          <Stack.Screen name="howtouse" component={HowToUse} />
          {/* Supervisor */}
          <Stack.Screen name="aspectsp" component={AspectSP} />
          <Stack.Screen name="editchildsp" component={EditChildSP} />
          <Stack.Screen name="assessmentsp" component={AssessmentSP} />
          {/* <Stack.Screen name="fmsp" component={FMSP} />
          <Stack.Screen name="rlsp" component={RLSP} />
          <Stack.Screen name="elsp" component={ELSP} />
          <Stack.Screen name="spsp" component={PSSP} /> */}
          <Stack.Screen name="trainingsp" component={TrainingSP} />
          <Stack.Screen name="addroom" component={AddRoom} />
          <Stack.Screen name="addchildSP" component={AddchildSP} />
          <Stack.Screen name="chooseroom" component={ChooseRoom} />
          <Stack.Screen name="choosechildsp" component={ChooseChildSP} />
          <Stack.Screen name="childdetailsp" component={ChildDetailSP} />
          <Stack.Screen name="graphdashboard" component={GraphDashboard} />
          <Stack.Screen name="editroom" component={EditRoom} />
          <Stack.Screen
            name="childdetailprforsp"
            component={ChildDetailPRforSP}
          />
          <Stack.Screen name="listhistorysp" component={ListHistorySP} />
          <Stack.Screen
            name="assessmentretrypr"
            component={AssessmentRetryPR}
          />
          <Stack.Screen
            name="assessmentretrysp"
            component={AssessmentRetrySP}
          />

          <Stack.Screen name="adminHome" component={HomeAD} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
