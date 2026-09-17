import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import LogScreen from '../screens/LogScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import CrewSetupScreen from '../screens/CrewSetupScreen';
import CrewManageScreen from '../screens/CrewManageScreen';
import { BoardIcon, LogIcon, ProfileIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCrew } from '../context/CrewContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    primary: colors.accent,
    text: colors.textPrimary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemibold, fontSize: 11 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Board"
        component={LeaderboardScreen}
        options={{ tabBarIcon: ({ color }) => <BoardIcon color={color} /> }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{ tabBarIcon: ({ color }) => <LogIcon color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </Tab.Navigator>
  );
}

function LoadingView() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export default function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { crews, loading: crewLoading } = useCrew();

  let content;
  if (authLoading) {
    content = <Stack.Screen name="Loading" component={LoadingView} />;
  } else if (!session) {
    content = <Stack.Screen name="Auth" component={AuthScreen} />;
  } else if (crewLoading) {
    content = <Stack.Screen name="Loading" component={LoadingView} />;
  } else if (crews.length === 0) {
    content = <Stack.Screen name="CrewSetup" component={CrewSetupScreen} />;
  } else {
    content = (
      <>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="CrewManage" component={CrewManageScreen} options={{ presentation: 'modal' }} />
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>{content}</Stack.Navigator>
    </NavigationContainer>
  );
}
