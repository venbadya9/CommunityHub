import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isOnline } from "../../../shared/hooks/network";
import { Post } from "../../../types/models";
import { communityApi } from "../../communities/services/communityApi";

interface CreatePostPayload {
  title: string;
  body: string;
}

// We don't call cancelQueries here like the toggle-join mutation does. Posts
// are prepended (not patched in place), so a background refetch finishing
// mid-mutation just means we briefly see a duplicate before onSettled
// invalidates - visually harmless, and not worth the extra await.
export const useCreatePost = (communityId: string) => {
  const queryClient = useQueryClient();
  const cacheKey = ["community-posts", communityId];

  const buildOptimisticPost = (payload: CreatePostPayload): Post => ({
    id: `temp-${Date.now()}`,
    title: payload.title,
    body: payload.body,
  });

  return useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      communityApi.addPostToCommunity(communityId, payload.title, payload.body),

    onMutate: async (payload) => {
      const net = await NetInfo.fetch();
      if (!isOnline(net)) {
        // Nothing to roll back to - addPostToCommunity queues it for later
        // and the list stays as-is until the queue drains.
        return { snapshot: null, queuedOffline: true };
      }

      const snapshot = queryClient.getQueryData<Post[]>(cacheKey) ?? [];
      queryClient.setQueryData<Post[]>(cacheKey, [
        buildOptimisticPost(payload),
        ...snapshot,
      ]);

      return { snapshot, queuedOffline: false };
    },

    onError: (_err, _payload, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(cacheKey, context.snapshot);
      }
    },

    onSettled: (result, _error, _payload, context) => {
      if (result && !context?.queuedOffline) {
        queryClient.invalidateQueries({ queryKey: cacheKey });
      }
    },
  });
};
