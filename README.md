# supabase-query

Supercharge your development speed with Supabase and react-query, combined!

## Features

- Caching – save database reads
- No more manually writing loading states
- Easily invalidate after mutations
- Leverage all of react-query's powerful query- and mutation API
- Build queries with the Supabase query builder
- Type support with Supabase v2 types

## Installation

`yarn add supabase-query @supabase/supabase-js react-query@^3`

or with npm:

`npm i supabase-query @supabase/supabase-js react-query@^3`

## Quick start

```tsx
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import { createClient } from "@supabase/supabase-js";
import {
  SupabaseQueryProvider,
  useSupabaseMutation,
  useSupabaseQuery,
} from "supabase-query";

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
  // The table name ("todos" here) will by default be used as the queryKey (see mutation)
  const { data, isLoading } = useSupabaseQuery((supabase) =>
    supabase.from("todos").select()
  );

  // Mutations
  // Access the client for invalidations
  const queryClient = useQueryClient();
  const { mutate, isLoading: isPosting } = useSupabaseMutation({
    onSuccess: () => queryClient.invalidateQueries("todos"),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
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
export default App;
```

## API

### useSupabaseQuery

```tsx
const { data, isLoading } = useSupabaseQuery(
  (supabase) => supabase.from("todos").select(),
  {
    onSuccess: () => {
      alert("success");
    },
    queryKey: ["todos", page],
  }
);
```

useSupabaseQuery accepts two arguments:
The first is a function that provides the supabase client as an argument,
and it expects a built query in return.

The table name will by default be used as the queryKey for react-query.

The second argument: react-query options, see their docs for all options. The options object also takes in
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

To leverage Supabase's schema type export you have to pass the schema to
supabase-query's hooks and export those hooks in your app for use:

`hooks/supabase.ts`

```ts
import {
  TypedUseSupabaseMutation,
  TypedUseSupabaseQuery,
  useSupabaseMutation,
  useSupabaseQuery,
} from "supabase-query";
import { DatabaseSchema } from "./db.types.ts";

export const useTypedSupabaseQuery: TypedUseSupabaseQuery<DatabaseSchema> =
  useSupabaseQuery;
export const useTypedSupabaseMutation: TypedUseSupabaseMutation<DatabaseSchema> =
  useSupabaseMutation;
```

Then use it in your app:

```tsx
import { useTypedSupabaseQuery } from "hooks/supabase";

function Todos() {
  // Data will be typed correctly
  const { data, isLoading } = useTypedSupabaseQuery(
    (supabase) =>
      // The Supabase client will be typed to give inference on all tables
      supabase.from("todos").select(),
    {
      // Data is typed in options
      onSuccess(data) {
        console.log(data[0].done);
      },
    }
  );
}
```
