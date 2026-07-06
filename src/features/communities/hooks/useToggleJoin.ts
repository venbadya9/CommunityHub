import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isOnline } from "../../../shared/hooks/network";
import { Community } from "../../../types/models";
import { communityApi } from "../services/communityApi";

type CommunityListPage = { data: Community[]; nextPage: number | null };
type CommunityListData = { pages: CommunityListPage[]; pageParams: unknown[] };

const applyToggle = (community: Community): Community => ({
  ...community,
  isJoined: !community.isJoined,
  memberCount: community.isJoined
    ? community.memberCount - 1
    : community.memberCount + 1,
});

export const useToggleJoin = (id: string) => {
  const queryClient = useQueryClient();
  const detailKey = ["community", id];

  return useMutation({
    mutationFn: async () => {
      const net = await NetInfo.fetch();

      if (!isOnline(net)) {
        communityApi.queueOfflineAction(id);
        return null;
      }

      return communityApi.toggleJoinState(id);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<Community>(detailKey);
      if (previousDetail) {
        queryClient.setQueryData(detailKey, applyToggle(previousDetail));
      }

      const listSnapshots = queryClient.getQueriesData<CommunityListData>({
        queryKey: ["communities"],
      });

      for (const [key, data] of listSnapshots) {
        if (!data) continue;
        queryClient.setQueryData<CommunityListData>(key, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((c) => (c.id === id ? applyToggle(c) : c)),
          })),
        });
      }

      return { previousDetail, listSnapshots };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
      context?.listSnapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};
