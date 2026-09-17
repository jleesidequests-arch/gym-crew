import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colors } from './src/theme/colors';
import RootNavigator from './src/navigation/RootNavigator';
import PinGateScreen from './src/screens/PinGateScreen';
import { AuthProvider } from './src/context/AuthContext';
import { CrewProvider } from './src/context/CrewContext';
import { CrewLogsProvider } from './src/context/CrewLogsContext';
import { setupWebHomeScreenMeta } from './src/web/homeScreenMeta';

const PIN_UNLOCK_KEY = 'gym-crew:pin-unlocked';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setupWebHomeScreenMeta();
    AsyncStorage.getItem(PIN_UNLOCK_KEY).then((v) => setUnlocked(v === 'true'));
  }, []);

  if (!fontsLoaded || unlocked === null) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!unlocked) {
    return (
      <SafeAreaProvider>
        <PinGateScreen
          onUnlock={() => {
            AsyncStorage.setItem(PIN_UNLOCK_KEY, 'true').catch(() => {});
            setUnlocked(true);
          }}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <AuthProvider>
      <CrewProvider>
        <CrewLogsProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </CrewLogsProvider>
      </CrewProvider>
    </AuthProvider>
  );
}
