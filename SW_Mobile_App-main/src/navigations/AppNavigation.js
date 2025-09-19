import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// 🔹 Auth Screens
import Splash from '../screens/auth/Splash';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import OTPVerification from '../screens/auth/OtpVerification';
import Resetpass1 from '../screens/auth/Resetpass1';
import Resetpass2 from '../screens/auth/Resetpass2';
import Newpass from '../screens/auth/Newpass';
import Updatedpass from '../screens/auth/Updatedpass';

// 🔹 Profile & Account
import ProfileScreen from '../screens/profile/Profile';
import Editacc from '../screens/profile/Editacc';
import Changepass from '../screens/profile/Changepass';

// 🔹 Main / Dashboard
import Dashboard from '../screens/dashboard/Dashboard';
import Notifications from '../screens/dashboard/Notifications';
import SettingsScreen from '../screens/dashboard/Settings';

// 🔹 Projects
import ViewProjects from '../screens/projects/ViewProjects';
import AddProject from '../screens/projects/AddProject';
import ProjectDetails from '../screens/projects/ProjectDetails';
import ProjectPhotos from '../screens/project/ProjectPhotos';
import ProjectReports from '../screens/project/ProjectReports';
import EditProject from '../screens/projects/EditProject';

// 🔹 Members
import AddMembersScreen from '../screens/members/AddMembers';
import ProjectMembers from '../screens/members/ProjectMembers';

// 🔹 Stages
import UpcommingStages from '../screens/stages/UpcommingStages';
import Stagedetails from '../screens/stages/Stagedetails';
import AddStageScreen from '../screens/stages/AddStageScreen';

// 🔹 Chat
import Chats from '../screens/chat/Chats';
import ChatScreen from '../screens/chat/ChatScreen';

// 🔹 Expenses - FIXED IMPORTS
import ExpenseTracking from '../screens/expense/ExpenseTracking';
import AddExpense from '../screens/expense/AddExpense';
import ViewAllExpenses from '../screens/expense/ViewAllExpenses';
import ExpenseDetails from '../screens/expense/ExpenseDetails';
import ManageBudget from '../screens/expense/ManageBudget';
import EditExpense from '../screens/expense/EditExpense';
import ExpenseReports from '../screens/expense/ExpenseReports';

// 🔹 Help Screen
import Help from '../screens/help/Help';

const Stack = createStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
        }}
      >

        {/* 🔹 Auth Flow */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="OtpVerification" component={OTPVerification} />
        <Stack.Screen name="Resetpass1" component={Resetpass1} />
        <Stack.Screen name="Resetpass2" component={Resetpass2} />
        <Stack.Screen name="Newpass" component={Newpass} />
        <Stack.Screen name="Updatedpass" component={Updatedpass} />

        {/* 🔹 Profile & Account */}
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Editacc" component={Editacc} />
        <Stack.Screen name="Changepass" component={Changepass} />

        {/* 🔹 Main / Dashboard */}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* 🔹 Projects & Stages */}
        <Stack.Screen name="ViewProjects" component={ViewProjects} />
        <Stack.Screen name="AddProject" component={AddProject} />
        <Stack.Screen name="ProjectDetails" component={ProjectDetails} />
        <Stack.Screen name="ProjectPhotos" component={ProjectPhotos} />
        <Stack.Screen name="ProjectReports" component={ProjectReports} />
        <Stack.Screen name="EditProject" component={EditProject} />
        <Stack.Screen name="UpcommingStages" component={UpcommingStages} />
        <Stack.Screen name="Stagedetails" component={Stagedetails} />
        <Stack.Screen name="AddStage" component={AddStageScreen} />

        {/* 🔹 Members */}
        <Stack.Screen name="AddMembers" component={AddMembersScreen} />
        <Stack.Screen name="ProjectMembers" component={ProjectMembers} />

        {/* 🔹 Chat */}
        <Stack.Screen name="Chats" component={Chats} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />

        {/* 🔹 Expenses */}
        <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
        <Stack.Screen name="AddExpense" component={AddExpense} />
        <Stack.Screen name="ViewAllExpenses" component={ViewAllExpenses} />
        <Stack.Screen name="ExpenseDetails" component={ExpenseDetails} />
        <Stack.Screen name="ManageBudget" component={ManageBudget} />
        <Stack.Screen name="EditExpense" component={EditExpense} />
        <Stack.Screen name="ExpenseReports" component={ExpenseReports} />

        {/* 🔹 Help & Support */}
        <Stack.Screen name="Help" component={Help} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;