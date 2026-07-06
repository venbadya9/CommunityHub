import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "./src/api/queryClient";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./src/shared/components/ErrorBoundary";
import { colors } from "./src/shared/theme/colors";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
