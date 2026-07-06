import { useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../../../shared/theme/colors";
import { formatMemberCount } from "../../../shared/utils/formatters";
import { CreatePostForm } from "../../posts/components/CreatePostForm";
import { useCommunityDetails } from "../hooks/useCommunityDetails";
import { useToggleJoin } from "../hooks/useToggleJoin";

export const CommunityDetailScreen = () => {
  const route = useRoute();
  const { communityId } = route.params as { communityId: string };

  const {
    community,
    posts,
    isLoadingCommunity,
    isLoadingPosts,
    isRefetchingPosts,
    refetchPosts,
    communityError,
    refetchCommunity,
    postsError,
  } = useCommunityDetails(communityId);

  const toggleMutation = useToggleJoin(communityId);

  if (isLoadingCommunity) {
    return (
      <ActivityIndicator
        size="large"
        style={styles.center}
        color={colors.accent}
      />
    );
  }

  if (communityError || !community) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load this community.</Text>
        <TouchableOpacity
          onPress={() => refetchCommunity()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{community.name}</Text>
        <Text style={styles.stats}>
          {formatMemberCount(community.memberCount)} members
        </Text>
        <Text style={styles.desc}>{community.description}</Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            community.isJoined ? styles.leaveBtn : styles.joinBtn,
          ]}
          onPress={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
        >
          <Text style={styles.btnText}>
            {community.isJoined ? "Leave Community" : "Join Community"}
          </Text>
        </TouchableOpacity>

        {toggleMutation.isError && (
          <TouchableOpacity
            style={styles.inlineRetry}
            onPress={() => toggleMutation.mutate()}
          >
            <Text style={styles.inlineRetryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formContainer}>
        <CreatePostForm communityId={communityId} />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Discussion</Text>
        <TouchableOpacity
          onPress={() => refetchPosts()}
          disabled={isRefetchingPosts}
        >
          <Text
            style={[
              styles.refreshText,
              isRefetchingPosts && styles.refreshDisabled,
            ]}
          >
            {isRefetchingPosts ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoadingPosts ? (
        <ActivityIndicator color={colors.accent} style={styles.postsLoader} />
      ) : postsError ? (
        <View style={styles.plainErrorContainer}>
          <Text style={styles.errorTextSmall}>Could not load posts.</Text>
          <TouchableOpacity
            onPress={() => refetchPosts()}
            style={styles.smallRetryButton}
          >
            <Text style={styles.smallRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : posts && posts.length === 0 ? (
        <Text style={styles.emptyPostsText}>
          No posts yet. Be the first to start a discussion!
        </Text>
      ) : (
        posts?.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: colors.textMuted, marginBottom: 12, textAlign: "center" },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stats: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  actionButton: {
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  joinBtn: { backgroundColor: colors.accent },
  leaveBtn: { backgroundColor: colors.warning },
  btnText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  inlineRetry: { marginTop: 10, alignItems: "center" },
  inlineRetryText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  formContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postsLoader: { marginVertical: 24 },
  emptyPostsText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  plainErrorContainer: { marginVertical: 16, paddingHorizontal: 4 },
  errorTextSmall: { color: colors.textMuted, fontSize: 14 },
  smallRetryButton: { marginTop: 6 },
  smallRetryText: { color: colors.accent, fontWeight: "600", fontSize: 14 },
  postCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  postBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 19 },
  refreshText: { color: colors.accent, fontSize: 13, fontWeight: "600" },
  refreshDisabled: { color: colors.textMuted },
});
