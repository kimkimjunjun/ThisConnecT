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

/**
 * 서버에서 여러 쿼리를 병렬 prefetch하고 HydrationBoundary로 감싸는 컴포넌트.
 * server-only: 클라이언트 번들에 포함되지 않음.
 *
 * @example
 * <PrefetchBoundary
 *   queries={[
 *     { queryKey: usePostsQuery.queryKey, queryFn: usePostsQuery.queryFn },
 *   ]}
 * >
 *   <PostsWidget />
 * </PrefetchBoundary>
 */
export const PrefetchBoundary = async ({
  queries,
  children,
}: {
  queries: PrefetchQuery[];
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();

  await Promise.all(
    queries.map((q) =>
      queryClient.prefetchQuery({
        queryKey: q.queryKey,
        queryFn: q.queryFn,
      }),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
