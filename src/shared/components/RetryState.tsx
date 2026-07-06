import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

interface RetryStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export const RetryState = ({
  title,
  message,
  onRetry,
  retryLabel = "Retry",
}: RetryStateProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    <TouchableOpacity style={styles.button} onPress={onRetry}>
      <Text style={styles.buttonText}>{retryLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});
