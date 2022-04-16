import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { SupabaseClient } from "@supabase/supabase-js";
import React, { useContext } from "react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
} from "react-query";

type Provider = {
  children: React.ReactNode;
  client: SupabaseClient;
};
const context = React.createContext<SupabaseClient | undefined>(undefined);

export function SupabaseQueryProvider({ children, client }: Provider) {
  return <context.Provider value={client}>{children}</context.Provider>;
}

export function useClient() {
  const client = useContext(context);
  if (!client) {
    throw new Error("Must be used inside SupabaseQueryProvider");
  }
  return client as SupabaseClient;
}

type GeneratedQuery = PostgrestFilterBuilder<any> & { _table?: string };

type QueryCreator = (
  supabase: SupabaseClient
) => PostgrestFilterBuilder<any> & { _table?: string };

const execute = (query: GeneratedQuery) =>
  new Promise<any>(async (resolve, reject) => {
    const { data, error } = await query;
    if (data) {
      resolve(data);
    } else {
      reject(error);
    }
  });

export function useSupabaseQuery<T = any>(
  queryCreator: QueryCreator,
  options?: UseQueryOptions<T> & { queryKey?: string | unknown[] }
) {
  const client = useClient();
  const query = queryCreator(client);

  return useQuery<T>(
    options?.queryKey ?? [query._table],
    () => execute(query),
    options
  );
}

declare module "react-query" {
  function useMutation<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  >(
    queryCreator: QueryCreator,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      "mutationFn"
    >
  ): UseMutationResult<TData, TError, TVariables, TContext>;
}

export function useSupabaseMutation<T = any>(options?: UseMutationOptions<T>) {
  const c = useClient();

  return useMutation(
    (queryCreator: QueryCreator) =>
      new Promise<any>((res, rej) => {
        queryCreator(c).then((d: any) => {
          if (d.error) {
            return rej(d.error);
          }
          return res(d.data);
        });
      }),
    options as any
  );
}
