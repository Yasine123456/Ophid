import { Stack } from 'expo-router';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="snake-guide" options={{ headerShown: false }} />
        <Stack.Screen name="nearest-hospital" options={{ headerShown: false }} />
        <Stack.Screen name="first-aid" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
        <Stack.Screen name="submit-analysis" options={{ headerShown: false }} />
        <Stack.Screen name="analysis-loading" options={{ headerShown: false }} />
        <Stack.Screen name="analysis-results" options={{ headerShown: false }} />
		<Stack.Screen name="report-detail" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}