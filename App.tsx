import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colors } from './src/theme/colors';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CrewProvider } from './src/context/CrewContext';
import { CrewLogsProvider } from './src/context/CrewLogsContext';
import { setupWebHomeScreenMeta } from './src/web/homeScreenMeta';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    setupWebHomeScreenMeta();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
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
