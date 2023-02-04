import { createClient } from "@supabase/supabase-js";
import { render } from "@testing-library/react";
import { SupabaseQueryProvider } from "../src";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
export * from "@testing-library/react";
import "@testing-library/jest-dom";

const supabaseClient = createClient("http://test.com", "key");

const queryClient = new QueryClient();

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SupabaseQueryProvider>
  );
}

export function customRender(children: React.ReactElement) {
  return render(children, { wrapper: Provider });
}

export async function sleep(ms = 100) {
  await new Promise((res) => setTimeout(res, ms));
}
