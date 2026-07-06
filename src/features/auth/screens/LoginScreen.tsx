import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../../shared/theme/colors";
import { LoginFields, loginSchema } from "../schemas/loginSchema";
import { authApi, InvalidCredentialsError } from "../services/authApi";
import { useAuthStore } from "../store/useAuthStore";

export const LoginScreen = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFields) => {
    setLoginError(null);
    try {
      const { token, user } = await authApi.login(data.email, data.password);
      setSession(token, user);
    } catch (err) {
      setLoginError(
        err instanceof InvalidCredentialsError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Community Hub</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              onBlur={onBlur}
              onChangeText={(text) => {
                setLoginError(null);
                onChange(text);
              }}
              value={value}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="test@demo.com"
              placeholderTextColor={colors.textMuted}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              onBlur={onBlur}
              onChangeText={(text) => {
                setLoginError(null);
                onChange(text);
              }}
              value={value}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      {loginError && <Text style={styles.loginErrorText}>{loginError}</Text>}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  text: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 14 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.bg,
  },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  loginErrorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: colors.accentMuted },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
