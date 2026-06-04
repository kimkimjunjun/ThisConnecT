import "server-only";

import {
  dehydrate,
  HydrationBoundary,
  type QueryFunction,
  type QueryKey,
} from "@tanstack/react-query";
import { getQueryClient } from "./query-client";

type PrefetchQuery = {
  queryKey: QueryKey;
  queryFn: QueryFunction<unknown>;
};

type PrefetchInfiniteQuery = {
  queryKey: QueryKey;
  queryFn: QueryFunction<unknown>;
  initialPageParam: unknown;
};

/**
 * 서버에서 여러 쿼리를 병렬 prefetch하고 HydrationBoundary로 감싸는 컴포넌트.
 * server-only: 클라이언트 번들에 포함되지 않음.
 *
 * @example
 * <PrefetchBoundary
 *   queries={[{ queryKey: useChannelsQuery.queryKey, queryFn: getChannels }]}
 *   infiniteQueries={[{
 *     queryKey: channelRoomsQueryKey(id, ''),
 *     queryFn: ({ pageParam }) => getChannelRoomsCursor(id, pageParam),
 *     initialPageParam: null,
 *   }]}
 * >
 *   <ChannelView channelId={id} />
 * </PrefetchBoundary>
 */
export const PrefetchBoundary = async ({
  queries = [],
  infiniteQueries = [],
  children,
}: {
  queries?: PrefetchQuery[];
  infiniteQueries?: PrefetchInfiniteQuery[];
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();

  await Promise.all([
    ...queries.map((q) =>
      queryClient.prefetchQuery({
        queryKey: q.queryKey,
        queryFn: q.queryFn,
      }),
    ),
    ...infiniteQueries.map((q) =>
      queryClient.prefetchInfiniteQuery({
        queryKey: q.queryKey,
        queryFn: q.queryFn,
        initialPageParam: q.initialPageParam as never,
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
