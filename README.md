# supabase-query

Supercharge your development speed with the best of both worlds from Supabase and react-query!

## Features

- Caching – save database reads
- No more manually writing loading states
- Easily invalidate after mutations
- Leverage all of react-query's powerful query- and mutation api
- Build queries with supabase's query builder
- Full type support

## Installation

`npm i supabase-query`

## Quick start

```tsx
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import { createClient } from "@supabase/supabase-js";
import { SupabaseQueryProvider } from "supabase-query";

const queryClient = new QueryClient();
const supabaseClient = createClient("https://foo.bar", "key");

function App() {
  return (
    // Provide SupabaseQuery provider to your app
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Todos />
      </QueryClientProvider>
    </SupabaseQueryProvider>
  );
}

function Todos() {
  // Use the provided supabase instance in the callback to build your query
  // The table name "todos" will by default be used as the queryKey (see mutation)
  const { data, isLoading } = useSupabaseQuery((supabase) =>
    supabase.from("todos").select()
  );

  // Mutations
  // Access the client for invalidations
  const queryClient = useQueryClient();
  const { mutate, isLoading: isPosting } = useSupabaseMutation({
    onSuccess: () => client.invalidateQueries("todos"),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      <button
        disabled={isPosting}
        // Use the mutate callback to insert to supabase
        onClick={() =>
          mutate((supabase) =>
            supabase.from("todos").insert([{ name: "new todo" }])
          )
        }
      >
        {isPosting ? "Submitting..." : "Add Todo"}
      </button>
    </div>
  );
}
```

## API

### useSupabaseQuery

```tsx
const { data, isLoading } = useSupabaseQuery(
  (supabase) => supabase.from("todos").select(),
  {
    onSuccess: () => {},
    queryKey: ["todos", page],
  }
);
```

useSupabaseQuery accepts two arguments:
The first is a function with the supabase client as an argument,
and it expects a built query in return.

The table name `"todos"` will by default be used as the queryKey for react-query.
Second arg: react-query opts, see their docs for all options. The options object also takes in
`queryKey` if you want to override the default key for a more dynamic one.

### useSupabaseMutation

```tsx
import { useQueryClient } from "react-query";

const client = useQueryClient();
const { mutate, isLoading: isPosting } = useSupabaseMutation({
  onSuccess: () => client.invalidateQueries("todos"),
});

function handlePost() {
  mutate((supabase) =>
    supabase.from("todos").insert([{ name: val, done: false }])
  );
}

<Button loading={isPosting} onClick={handlePost}>
  Add todo
</Button>;
```

The `mutate` function is used the same way as the useSupabaseQuery callback argument
with the supabase client provided.

## TypeScript

```ts
// data is now of type Todo[]
const { data } = useSupabaseQuery<Todo[]>(...)

```
