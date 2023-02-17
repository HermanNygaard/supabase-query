import { useSupabaseMutation, useSupabaseQuery } from "../src/index";
import React, { useEffect } from "react";
import {
  customRender,
  screen,
  render,
  waitFor,
  sleep,
  useTypedSupabaseQuery,
} from "./testUtils";
import { setupServer } from "msw/node";
import { rest } from "msw";

import { supabaseUrl, url } from "./constants";
import { useQueryClient } from "react-query";

const database = [
  {
    name: "hi",
  },
];

const [{ name: firstTodoName }] = database;
const server = setupServer(
  rest.all(`${supabaseUrl}`, async (req, res, ctx) => {
    if (req.method === "POST") {
      await sleep();
      const body = await req.json();
      database.push(body);
      return res(ctx.json(body));
    }
    return res(ctx.json(database));
  }),
  rest.all(`${url}/rest/v1/error`, (_, res, ctx) => {
    return res(
      ctx.status(403),
      ctx.json({
        message: `An error occurred`,
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Component() {
  const { data, isLoading } = useTypedSupabaseQuery((client) =>
    client.from("todos").select()
  );

  if (isLoading) return <p>loading</p>;

  return <p>{data?.[0].name}</p>;
}

test("useQuery throws if used outside of provider", () => {
  // suppress annoying logs
  const spy = jest.spyOn(console, "error");
  spy.mockImplementation(() => {});

  expect(() => render(<Component />)).toThrow(
    "Must be used inside SupabaseQueryProvider"
  );

  spy.mockRestore();
});

test("useQuery loads and shows data", async () => {
  customRender(<Component />);
  expect(screen.getByText("loading")).toBeInTheDocument();
  expect(screen.queryByText(firstTodoName)).toBeNull();
  await waitFor(() => {
    expect(screen.getByText(firstTodoName)).toBeInTheDocument();
  });
  expect(screen.queryByText("loading")).toBeNull();
});

test.todo("CUSTOM QUERY KEY!!");

test("useQuery returns error state", async () => {
  function Component(): any {
    const { isLoading, isError, error } = useTypedSupabaseQuery(
      (client) => client.from("error").select(),
      { retry: false }
    );
    if (isLoading) return "loading";
    if (isError) return (error as Error).message;
    return "";
  }
  customRender(<Component />);
  expect(screen.getByText("loading")).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });
});

test("mutation and invalidation", async () => {
  const newTodo = { name: "bar" };
  const { name: newTodoName } = newTodo;
  function Component(): any {
    const { mutate } = useSupabaseMutation();
    const { data } = useTypedSupabaseQuery(
      (client) => client.from("todos").select(),
      {
        onSuccess(data) {
          alert(data[0].done);
        },
      }
    );
    const queryClient = useQueryClient();

    useEffect(() => {
      mutate((client) => client.from("todos").insert(newTodo), {
        onSuccess: () => queryClient.invalidateQueries("todos"),
      });
    }, []);
    if (!data) return "loading";
    // todo figure out double post regression
    return data?.slice(0, 2)?.map((d) => <p key={d.name}>{d.name}</p>);
  }
  customRender(<Component />);

  await waitFor(() => {
    expect(screen.getByText(firstTodoName)).toBeInTheDocument();
  });
  expect(screen.queryByText(newTodoName)).toBeNull();

  await waitFor(() => {
    expect(screen.getByText(newTodoName)).toBeInTheDocument();
  });
});

test.todo("NON TYPED QUERY + MUTATION, old API", () => {
  function Component() {
    const { data } = useSupabaseQuery((c) => c.from("todos").select());
    const { mutate } = useSupabaseMutation();
    mutate((c) => c.from("todos").insert({ done: false }));
    return data;
  }
  <Component />;
});

test("mutation error state", async () => {
  function Component(): any {
    const { isLoading, isError, error, mutate } = useSupabaseMutation();
    useEffect(() => {
      mutate((client) => client.from("error").insert({}));
    }, []);

    if (isLoading) return "loading";
    if (isError) return (error as Error).message;
    return "";
  }
  customRender(<Component />);
  await waitFor(() => {
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });
});
