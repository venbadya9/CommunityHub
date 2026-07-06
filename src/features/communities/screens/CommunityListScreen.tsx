import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { RootStackParamList } from "../../../navigation/types";
import { RetryState } from "../../../shared/components/RetryState";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { colors } from "../../../shared/theme/colors";
import { formatMemberCount } from "../../../shared/utils/formatters";
import { Community } from "../../../types/models";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCommunities } from "../hooks/useCommunities";

type NavProp = NativeStackNavigationProp<RootStackParamList, "CommunityList">;

export const CommunityListScreen = () => {
  const navigation = useNavigation<NavProp>();
  const clearSession = useAuthStore((s) => s.clearSession);
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "members">("name");
  const listRef = useRef<FlashListRef<Community>>(null);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
    error,
  } = useCommunities(debouncedSearch, sortBy);

  const [pageError, setPageError] = useState(false);

  const items: Community[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  useEffect(() => {
    listRef.current?.scrollToTop({ animated: false });
  }, [sortBy]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={clearSession} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, clearSession]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    setPageError(false);
    fetchNextPage().catch(() => setPageError(true));
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View>
          <ActivityIndicator
            color={colors.accent}
            style={styles.footerLoader}
          />
          <View style={{ height: 16 }} />
        </View>
      );
    }
    if (pageError) {
      return (
        <View>
          <TouchableOpacity style={styles.footerRetry} onPress={loadMore}>
            <Text style={styles.footerRetryText}>
              Could not load more. Tap to retry.
            </Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </View>
      );
    }
    return <View style={{ height: 16 }} />;
  }, [isFetchingNextPage, pageError, loadMore]);

  const renderItem = useCallback(
    ({ item }: { item: Community }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("CommunityDetail", { communityId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.isJoined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Joined</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.cardDetail}>
          {formatMemberCount(item.memberCount)} members
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  if (isError && items.length === 0) {
    return (
      <RetryState
        title="Could not load communities"
        message={error instanceof Error ? error.message : "Check connection"}
        onRetry={refetch}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          paddingLeft: 16 + insets.left,
          paddingRight: 16 + insets.right,
        },
      ]}
    >
      <TextInput
        style={styles.searchBar}
        placeholder="Search communities..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sortRowHeader}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <TouchableOpacity
          style={[styles.sortItem, sortBy === "name" && styles.sortItemActive]}
          onPress={() => setSortBy("name")}
        >
          <Text
            style={[
              styles.sortItemText,
              sortBy === "name" && styles.sortTextActive,
            ]}
          >
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortItem,
            sortBy === "members" && styles.sortItemActive,
          ]}
          onPress={() => setSortBy("members")}
        >
          <Text
            style={[
              styles.sortItemText,
              sortBy === "members" && styles.sortTextActive,
            ]}
          >
            Members
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={styles.loader}
          color={colors.accent}
        />
      ) : (
        <FlashList
          key={sortBy}
          ref={listRef}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isLoading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No communities found.</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  searchBar: {
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  sortRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  sortLabel: { fontSize: 12, color: colors.textMuted, marginRight: 4 },
  sortItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  sortItemActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  sortTextActive: { color: colors.white },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 19,
  },
  cardDetail: { fontSize: 12, fontWeight: "500", color: colors.textMuted },
  badge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  badgeText: { fontSize: 11, color: colors.success, fontWeight: "600" },
  footerLoader: { paddingVertical: 14 },
  footerRetry: { paddingVertical: 14, alignItems: "center" },
  footerRetryText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutBtn: { paddingVertical: 4 },
  logoutText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
});
