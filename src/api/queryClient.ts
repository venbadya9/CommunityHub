import { QueryClient } from "@tanstack/react-query";

const CACHE_TIME_24H = 1000 * 60 * 60 * 24;
const REFRESH_TIME_2M = 1000 * 60 * 2;

const isDev = __DEV__;

const queryConfiguration = {
  queries: {
    gcTime: CACHE_TIME_24H,
    staleTime: isDev ? 0 : REFRESH_TIME_2M,
    retry: isDev ? 2 : 5,
    networkMode: "offlineFirst",
  },
  mutations: {
    networkMode: "offlineFirst",
  },
} as const;

export const queryClient = new QueryClient({
  defaultOptions: queryConfiguration,
});
