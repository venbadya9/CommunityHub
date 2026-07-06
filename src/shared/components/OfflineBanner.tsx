import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { colors } from "../theme/colors";

export const OfflineBanner = () => {
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <View style={[styles.container, { bottom: insets.bottom }]}>
      <Text style={styles.text}>
        You are currently offline. Showing cached data.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.danger,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9999,
  },
  text: { color: colors.white, fontSize: 12, fontWeight: "600" },
});
