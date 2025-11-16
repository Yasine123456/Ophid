import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { ThemeProvider, useTheme } from './_context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Animated, Pressable, ActivityIndicator } from 'react-native';

// Keep the splash visible until the first frame is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [bootVisible, setBootVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 150);
    return () => {
      clearTimeout(t);
    };
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="snake-guide" options={{ headerShown: false }} />
          <Stack.Screen name="nearest-hospital" options={{ headerShown: false }} />
          <Stack.Screen name="first-aid" options={{ headerShown: false }} />
          <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
          <Stack.Screen name="submit-analysis" options={{ headerShown: false }} />
          <Stack.Screen name="analysis-loading" options={{ headerShown: false }} />
          <Stack.Screen name="analysis-results" options={{ headerShown: false }} />
          <Stack.Screen name="report-detail" options={{ headerShown: false }} />
        </Stack>
        {bootVisible && <BootOverlay onDismiss={() => setBootVisible(false)} />}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function BootOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Pressable onPress={onDismiss} style={[styles.bootOverlay, { backgroundColor: colors.background }]}> 
      <Animated.Text style={[styles.bootTitle, { color: colors.textPrimary, transform: [{ scale }] }]}>Ophid</Animated.Text>
      <ActivityIndicator style={{ marginTop: 16 }} size="small" color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bootOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootTitle: {
    fontSize: 42,
    fontWeight: 'bold',
  },
});
