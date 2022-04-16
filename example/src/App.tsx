import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "react-query";

import { createClient } from "@supabase/supabase-js";
import {
  SupabaseQueryProvider,
  useSupabaseMutation,
  useSupabaseQuery,
} from "supabase-query";

const queryClient = new QueryClient();

const supabaseClient = createClient(
  import.meta.env.VITE_url,
  import.meta.env.VITE_key
);
function App() {
  return (
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
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
  //const { data, isLoading, error, refetch } = useSelect("todos");
  //const { mutate, isLoading: isPosting } = useInsert("todos");
  const client = useQueryClient();
  const [limit, setLimit] = useState(7);
  const { data, isLoading } = useSupabaseQuery<{ name: string; id: number }[]>(
    (supabase) => supabase.from("todos").select()
  );
  const {
    mutate,
    isLoading: isPosting,
    data: ok,
    error,
    isError,
  } = useSupabaseMutation<{ name: string }>({
    onSuccess: () => client.invalidateQueries("todos"),
    onError: () => alert("noo"),
  });
  console.log("yoo", ok);
  const [val, setVal] = useState("");
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map((t) => (
        <div key={t.id}>
          {t.name}

          <DeleteButton id={t.id} />
        </div>
      ))}
      <input type="number" onChange={({ target }) => setLimit(target.value)} />
      {JSON.stringify(error)}
      <input value={val} onChange={({ target }) => setVal(target.value)} />
      <button
        onClick={() => {
          setVal("");
          const a = mutate((supabase) =>
            supabase.from("todos").insert([{ name: val, done: false }])
          );
          console.log("a", a);
        }}
      >
        Add todo
      </button>
    </div>
  );
}

export default App;
