import { useQuery } from "@tanstack/react-query";
import { communityApi } from "../services/communityApi";

export const useCommunityDetails = (id: string) => {
  const detailsQuery = useQuery({
    queryKey: ["community", id],
    queryFn: () => communityApi.getCommunityById(id),
  });

  const postsQuery = useQuery({
    queryKey: ["community-posts", id],
    queryFn: () => communityApi.getPostsByCommunityId(id),
  });

  return {
    community: detailsQuery.data,
    posts: postsQuery.data,
    isLoadingCommunity: detailsQuery.isLoading,
    isLoadingPosts: postsQuery.isLoading,
    isRefetchingPosts: postsQuery.isRefetching,
    refetchPosts: postsQuery.refetch,
    refetchCommunity: detailsQuery.refetch,
    communityError: detailsQuery.error,
    postsError: postsQuery.error,
  };
};
