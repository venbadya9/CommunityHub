import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { View } from "react-native";
import { queryClient } from "../api/queryClient";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import { CommunityDetailScreen } from "../features/communities/screens/CommunityDetailScreen";
import { CommunityListScreen } from "../features/communities/screens/CommunityListScreen";
import { communityApi } from "../features/communities/services/communityApi";
import { OfflineBanner } from "../shared/components/OfflineBanner";
import {
  NetworkProvider,
  useNetworkStatus,
} from "../shared/hooks/useNetworkStatus";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NetworkProvider>
    <AppNavigatorContent />
  </NetworkProvider>
);

const AppNavigatorContent = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      communityApi.processOfflineQueue().then((processedCount) => {
        if (processedCount > 0) {
          queryClient.invalidateQueries({ queryKey: ["communities"] });
          queryClient.invalidateQueries({ queryKey: ["community-posts"] });
        }
      });
    }
  }, [isOnline]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{ headerBackButtonDisplayMode: "minimal" }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="CommunityList"
              component={CommunityListScreen}
              options={{ title: "Explore" }}
            />
            <Stack.Screen
              name="CommunityDetail"
              component={CommunityDetailScreen}
              options={{ title: "" }}
            />
          </>
        )}
      </Stack.Navigator>
      <OfflineBanner />
    </View>
  );
};
