import { useInfiniteQuery } from "@tanstack/react-query";
import { communityApi } from "../services/communityApi";

export const useCommunities = (search: string) => {
  return useInfiniteQuery({
    queryKey: ["communities", search],
    queryFn: ({ pageParam }) =>
      communityApi.getCommunitiesList(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
