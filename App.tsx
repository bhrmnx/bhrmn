import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './lib/auth';
import SignInScreen from './screens/SignInScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import RootTabs from './navigation/RootTabs';
import { colors } from './theme';

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.indigo} />
    </View>
  );
}

function Root() {
  const { session, profile, loading } = useAuth();

  if (loading) return <Loading />;
  if (!session) return <SignInScreen />;

  // The profile row is created by a DB trigger at signup, but it is a stub
  // until the traveller picks a home city and their Travel DNA.
  if (!profile) return <Loading />;

  const needsOnboarding = !profile.home_city_id || (profile.dna_declared ?? []).length === 0;
  return needsOnboarding ? <OnboardingScreen /> : <RootTabs />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
