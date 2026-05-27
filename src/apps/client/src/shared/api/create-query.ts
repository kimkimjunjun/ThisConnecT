import {
  useQuery,
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

export type QueryOverrides<
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<TData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

type QueryDefinition<
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TData, TQueryKey>;
  options?: QueryOverrides<TData, TError, TQueryKey>;
};

type QueryHook<TData, TError = Error, TQueryKey extends QueryKey = QueryKey> = {
  (
    overrides?: QueryOverrides<TData, TError, TQueryKey>,
  ): UseQueryResult<TData, TError>;
  // 서버 컴포넌트에서 prefetch 시 재사용할 수 있도록 정적 프로퍼티로 노출
  queryKey: TQueryKey;
  queryFn: QueryFunction<TData, TQueryKey>;
};

/**
 * queryKey·queryFn을 한 곳에 정의하고, 컴포넌트에서 options만 override하는 패턴
 *
 * @example
 * export const usePostsQuery = createQuery({
 *   queryKey: ['posts'] as const,
 *   queryFn: () => fetchAPI<Post[]>('/posts'),
 *   options: { staleTime: 5 * 60 * 1000 },
 * })
 *
 * // 클라이언트 컴포넌트
 * const { data } = usePostsQuery({ enabled: isReady })
 *
 * // 서버 컴포넌트 prefetch
 * await queryClient.prefetchQuery({
 *   queryKey: usePostsQuery.queryKey,
 *   queryFn: usePostsQuery.queryFn,
 * })
 */
export const createQuery = <
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
>(
  definition: QueryDefinition<TData, TError, TQueryKey>,
): QueryHook<TData, TError, TQueryKey> => {
  const useDefinedQuery = (
    overrides?: QueryOverrides<TData, TError, TQueryKey>,
  ): UseQueryResult<TData, TError> =>
    useQuery<TData, TError, TData, TQueryKey>({
      ...definition.options,
      ...overrides,
      queryKey: definition.queryKey,
      queryFn: definition.queryFn,
    });

  useDefinedQuery.queryKey = definition.queryKey;
  useDefinedQuery.queryFn = definition.queryFn;

  return useDefinedQuery;
};
