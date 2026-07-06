import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { colors } from "../theme/colors";

export const OfflineBanner = () => {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={styles.container}>
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
    bottom: 0,
    zIndex: 9999,
  },
  text: { color: colors.white, fontSize: 12, fontWeight: "600" },
});
