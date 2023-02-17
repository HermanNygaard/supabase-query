import type {
  PostgrestSingleResponse,
  PostgrestBuilder,
} from "@supabase/postgrest-js";
import { SupabaseClient } from "@supabase/supabase-js";
import React, { useContext } from "react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "react-query";
import { getTableName } from "./util";

type Provider = {
  children: React.ReactNode;
  client: SupabaseClient;
};

export function SupabaseQueryProvider({ children, client }: Provider) {
  return <context.Provider value={client}>{children}</context.Provider>;
}

async function execute(query: any) {
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}

type QueryCreator<T, Result> = (
  client: SupabaseClient<T>
) => PostgrestBuilder<Result>;

const context = React.createContext<SupabaseClient | undefined>(undefined);

function useClient() {
  const client = useContext(context);
  if (!client) {
    throw new Error("Must be used inside SupabaseQueryProvider");
  }
  return client;
}

type Query = (client: SupabaseClient) => PostgrestBuilder<any>;

export type TypedUseSupabaseQuery<T> = <Result>(
  queryCreator: QueryCreator<T, Result>,
  options?: UseQueryOptions<Result>
) => UseQueryResult<PostgrestSingleResponse<Result>["data"]>;

export function useSupabaseQuery<Result>(
  queryCreator: Query,
  options?: UseQueryOptions<Result>
) {
  const client = useClient();
  const query = queryCreator(client);

  return useQuery(
    // @ts-ignore
    // query.url is protected in Class
    options?.queryKey ?? [getTableName(query.url)],
    () => execute(query),
    options as any
  );
}

export type TypedUseSupabaseMutation<T> = <Result>(
  options?: UseMutationOptions
) => UseMutationResult<
  PostgrestSingleResponse<Result>["data"],
  unknown,
  QueryCreator<T, Result>,
  unknown
>;

export function useSupabaseMutation<Result>(options?: UseMutationOptions) {
  const c = useClient();

  async function mutate(
    queryCreator: Query
  ): Promise<PostgrestSingleResponse<Result>["data"]> {
    const query = queryCreator(c);
    return execute(query);
  }
  return useMutation<
    PostgrestSingleResponse<Result>["data"],
    unknown,
    Query,
    unknown
  >(mutate, options as any);
}

export { getTableName as getTable };
