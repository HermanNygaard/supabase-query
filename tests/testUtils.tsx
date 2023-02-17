import { createClient } from "@supabase/supabase-js";
import { render } from "@testing-library/react";
import {
  SupabaseQueryProvider,
  TypedUseSupabaseMutation,
  TypedUseSupabaseQuery,
  useSupabaseMutation,
  useSupabaseQuery,
} from "../src";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
export * from "@testing-library/react";
import "@testing-library/jest-dom";
import { Database } from "./db.types";

const supabaseClient = createClient<Database>("http://test.com", "key");
const queryClient = new QueryClient();

export const useTypedSupabaseQuery: TypedUseSupabaseQuery<Database> =
  useSupabaseQuery;

export const useTypedSupabaseMutation: TypedUseSupabaseMutation<Database> =
  useSupabaseMutation;

const a = supabaseClient.from("test").insert({}).select();
a.then;
const f = useTypedSupabaseMutation();

const b = useSupabaseMutation();
b.mutate((c) => c.from("too").insert({}));
/* const e = f.mutate((c) =>
  c
    .from("test")
    .insert({})
    .select()
    .then((e) => e.data[0].cool) */

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SupabaseQueryProvider>
  );
}

export function customRender(children: any) {
  return render(children, { wrapper: Provider });
}

export async function sleep(ms = 100) {
  await new Promise((res) => setTimeout(res, ms));
}
