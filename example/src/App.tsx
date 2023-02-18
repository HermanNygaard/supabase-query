import { useState } from "react";
import "./App.css";

import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";

import { createClient } from "@supabase/supabase-js";
import {
  SupabaseQueryProvider,
  TypedUseSupabaseMutation,
  TypedUseSupabaseQuery,
  useSupabaseMutation,
  useSupabaseQuery,
} from "supabase-query";
import { Database } from "../db.types";

const queryClient = new QueryClient();

const supabaseClient = createClient<Database>(
  import.meta.env.VITE_url,
  import.meta.env.VITE_key
);

export const useTypedSupabaseQuery: TypedUseSupabaseQuery<Database> =
  useSupabaseQuery;

export const useTypedSupabaseMutation: TypedUseSupabaseMutation<Database> =
  useSupabaseMutation;

function App() {
  return (
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Todos />
      </QueryClientProvider>
    </SupabaseQueryProvider>
  );
}

function DeleteButton({ id }) {
  const client = useQueryClient();
  const { mutate } = useSupabaseMutation({
    onSuccess: () => client.invalidateQueries("todos"),
  });

  return (
    <button
      onClick={() =>
        mutate((client) => client.from("todos").delete().match({ id }))
      }
    >
      delete
    </button>
  );
}

export function Todos() {
  const client = useQueryClient();
  const [limit, setLimit] = useState(7);
  const { data, isLoading, isError, error } = useTypedSupabaseQuery(
    (supabase) => supabase.from("todos").select()
  );

  const {
    mutate,
    isLoading: isPosting,
    data: ok,
  } = useTypedSupabaseMutation({
    onSuccess: (env) => {
      client.invalidateQueries("todos");
    },
    onError: () => alert("noo"),
  });
  console.log({ ok });

  const [val, setVal] = useState("");
  if (isLoading) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "50vh",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {data?.map((t) => (
          <div key={t.id}>
            {t.name}

            <DeleteButton id={t.id} />
          </div>
        ))}
      </div>
      <input type="number" onChange={({ target }) => setLimit(target.value)} />
      {JSON.stringify(error)}
      <input value={val} onChange={({ target }) => setVal(target.value)} />
      <button
        onClick={() => {
          setVal("");
          mutate((supabase) =>
            supabase.from("todos").insert([{ name: val, done: false }])
          );
        }}
      >
        Add todo
      </button>
    </div>
  );
}

export default App;
