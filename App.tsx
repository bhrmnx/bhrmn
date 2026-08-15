import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './lib/auth';
import SignInScreen from './screens/SignInScreen';
import HomeScreen from './screens/HomeScreen';
import { colors } from './theme';

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }
  return session ? <HomeScreen /> : <SignInScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
      <StatusBar style="dark" />
    </AuthProvider>
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
