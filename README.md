# supabase-query

The best of both worlds from Supabase and react-query

## Features

- Caching – save database reads
- Leverage react-query's powerful query- and mutation api
- Full type support

## Installation

`npm i supabase-query`

## Setup

```tsx
import { QueryClient, QueryClientProvider } from "react-query";
import { createClient } from "@supabase/supabase-js";
import { SupabaseQueryProvider } from "supabase-query";

const queryClient = new QueryClient();
const supabaseClient = createClient("https://foo.bar", "key");

function App() {
  return (
    <SupabaseQueryProvider client={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Todos />
      </QueryClientProvider>
    </SupabaseQueryProvider>
  );
}
```

## Usage

## API

### useSupabaseQuery

```tsx
const { data, isLoading } = useSupabaseQuery((supabase) =>
  supabase.from("todos").select()
);
```

useSupabaseQuery accepts two arguments:
the first is a function with the supabase client as an argument,
and it expects a built query in return.

the from("todos") string will be used as the queryKey for react-query, see mutation below:

Second arg: react-query opts, see their docs

queryKey: override if needed if you need more dynamic key:

useSupabase((supabase: SupabaseClient) => SupabaseRestFilter)

See react-querys useQuery for complete API

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
