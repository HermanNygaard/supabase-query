import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { SupabaseClient } from "@supabase/supabase-js";
import React, { useContext } from "react";
import {
  useMutation,
  UseMutationOptions,
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

async function execute(query: GeneratedQuery): Promise<any> {
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}

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

export function useSupabaseMutation<T = any>(options?: UseMutationOptions<T>) {
  const c = useClient();

  return useMutation(
    (queryCreator: QueryCreator) => {
      const query = queryCreator(c);
      return execute(query);
    },

    options as any
  );
}
