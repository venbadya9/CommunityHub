import { useInfiniteQuery } from "@tanstack/react-query";
import { communityApi } from "../services/communityApi";

export const useCommunities = (search: string, sortBy: "name" | "members") => {
  return useInfiniteQuery({
    queryKey: ["communities", search, sortBy],
    queryFn: ({ pageParam }) =>
      communityApi.getCommunitiesList(pageParam, search, sortBy),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
