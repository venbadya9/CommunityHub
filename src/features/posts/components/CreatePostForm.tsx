import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { colors } from "../../../shared/theme/colors";
import { useCreatePost } from "../hooks/useCreatePost";
import { useDraftActions, useDraftStore } from "../store/useDraftStore";

interface FormData {
  title: string;
  body: string;
}

interface CreatePostFormProps {
  communityId: string;
}

export const CreatePostForm = ({ communityId }: CreatePostFormProps) => {
  const {
    mutate,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useCreatePost(communityId);

  const draft = useDraftStore((state) => state.drafts[communityId]);
  const { saveDraft, clearDraft } = useDraftActions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: draft?.title ?? "",
      body: draft?.body ?? "",
    },
  });

  const title = useWatch({ control, name: "title" });
  const body = useWatch({ control, name: "body" });

  const debouncedTitle = useDebounce(title, 400);
  const debouncedBody = useDebounce(body, 400);

  useEffect(() => {
    if (debouncedTitle || debouncedBody) {
      saveDraft(communityId, debouncedTitle, debouncedBody);
    }
  }, [debouncedTitle, debouncedBody, communityId, saveDraft]);

  const lastAttemptRef = useRef<FormData | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  const submit = (data: FormData) => {
    if (isPending) return;
    lastAttemptRef.current = data;
    setQueuedMessage(null);

    mutate(
      { title: data.title, body: data.body },
      {
        onSuccess: (result) => {
          clearDraft(communityId);
          reset({ title: "", body: "" });
          lastAttemptRef.current = null;

          if (result === null) {
            setQueuedMessage(
              "You're offline. This post will be shared once you're back online.",
            );
          }
        },
      },
    );
  };

  const onSubmit = (data: FormData) => submit(data);

  const onRetry = () => {
    if (lastAttemptRef.current) submit(lastAttemptRef.current);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>New Post</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          rules={{
            required: "Title is required",
            minLength: { value: 3, message: "Title is too short" },
            maxLength: { value: 120, message: "Title is too long" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Give your post a title"
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isPending}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.fieldError}>{errors.title.message}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Body</Text>
        <Controller
          control={control}
          name="body"
          rules={{
            required: "Body is required",
            minLength: { value: 10, message: "Say a bit more than that" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.body && styles.inputError,
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              editable={!isPending}
            />
          )}
        />
        {errors.body && (
          <Text style={styles.fieldError}>{errors.body.message}</Text>
        )}
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            {error instanceof Error
              ? error.message
              : "Couldn't post that. Please try again."}
          </Text>
          <View style={styles.errorBannerActions}>
            <TouchableOpacity onPress={onRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetMutation()}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {queuedMessage && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>{queuedMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isPending}
      >
        {isPending ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={styles.submitButtonTextDisabled}>Posting...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  textArea: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  fieldError: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 2,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  errorBannerActions: { flexDirection: "row", gap: 14 },
  retryText: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  dismissText: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  infoBanner: {
    backgroundColor: colors.infoBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  infoBannerText: { color: colors.info, fontSize: 12 },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitButtonDisabled: { backgroundColor: colors.accentMuted },
  submitButtonText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  submitButtonTextDisabled: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
